import { extend } from 'flarum/common/extend';
import Page from 'flarum/common/components/Page';
import Link from 'flarum/common/components/Link';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';

app.initializers.add('huseyinfiliz-sticky-title', () => {
  const updateScrubberTitle = (element, discussion) => {
    const replaceOriginal = app.forum.attribute('stickyTitleScrubberReplace');
    const isMobile = window.innerWidth <= 767;
    const shouldReplace = replaceOriginal === 'both' || (replaceOriginal === 'mobile' && isMobile) || (replaceOriginal === 'desktop' && !isMobile);

    if (shouldReplace && discussion) {
      const scrubberFirst = element.querySelector('.Scrubber-first');
      if (scrubberFirst && !scrubberFirst.querySelector('.ScrubberTitle')) {
        const icon = scrubberFirst.querySelector('i');
        scrubberFirst.innerHTML = '';
        if (icon) {
          scrubberFirst.appendChild(icon.cloneNode(true));
          scrubberFirst.appendChild(document.createTextNode(' '));
        }
        const titleSpan = document.createElement('span');
        titleSpan.className = 'ScrubberTitle';
        titleSpan.textContent = discussion.title();
        titleSpan.title = discussion.title();
        scrubberFirst.appendChild(titleSpan);
      }
    }
  };

  if (window.innerWidth <= 767) {
    const addTitleToHeader = (discussion) => {
      if (!discussion) return;

      const blogTitleText = discussion.title();

      if (blogTitleText) {
        const titleControlButton = document.querySelector('.App-titleControl .Dropdown-toggle');
        if (!titleControlButton) return;

        const originalLabel = titleControlButton.querySelector('.Button-label');
        const originalCaret = titleControlButton.querySelector('.Button-caret');
        if (originalLabel) originalLabel.style.display = 'none';
        if (originalCaret) originalCaret.style.display = 'none';

        const existingTitleText = titleControlButton.querySelector('.PageTitle-text');
        if (existingTitleText) {
          existingTitleText.textContent = blogTitleText.trim();
          return;
        }

        const titleElement = document.createElement('div');
        titleElement.className = 'PageTitle-container';

        const titleSpan = document.createElement('span');
        titleSpan.className = 'PageTitle-text';
        titleSpan.textContent = blogTitleText.trim();

        const sortIcon = document.createElement('i');
        sortIcon.className = 'fas fa-sort PageTitle-sortIcon';

        titleElement.appendChild(titleSpan);
        titleElement.appendChild(sortIcon);

        titleControlButton.prepend(titleElement);
      }
    };

    const cleanupStickyTitle = () => {
      const titleControlButton = document.querySelector('.App-titleControl .Dropdown-toggle');
      if (titleControlButton) {
        titleControlButton.querySelector('.PageTitle-container')?.remove();

        const originalLabel = titleControlButton.querySelector('.Button-label');
        const originalCaret = titleControlButton.querySelector('.Button-caret');
        if (originalLabel) originalLabel.style.display = '';
        if (originalCaret) originalCaret.style.display = '';
      }
    };

    const cleanupPageTitle = () => {
      const appNavigation = document.querySelector('#app-navigation .Navigation');
      if (appNavigation) {
        const pageTitle = appNavigation.querySelector('.PageTitle.Navigation-title');
        if (pageTitle) {
          pageTitle.remove();
        }
      }
    };

    const isFofPage = () => {
      const currentRoute = app.current?.get?.('routeName');
      return currentRoute === 'page' || currentRoute?.startsWith('page.');
    };

    const addPageTitle = () => {
      cleanupPageTitle();

      const fofPagesEnabled = app.forum?.attribute?.('stickyTitleFofPagesHeader') ?? true;

      if (!fofPagesEnabled) return;

      if (!isFofPage()) return;

      setTimeout(() => {
        const pageTitle = document.querySelector('.PageHero-title, h1.PageHero-title, .Page-title');
        const appNavigation = document.querySelector('#app-navigation .Navigation');

        if (pageTitle && appNavigation && !appNavigation.querySelector('.PageTitle')) {
          const titleElement = document.createElement('div');
          titleElement.className = 'PageTitle Navigation-title';
          titleElement.textContent = pageTitle.textContent.trim();

          const backButton = appNavigation.querySelector('.Navigation-back');
          if (backButton && backButton.nextSibling) {
            backButton.parentNode.insertBefore(titleElement, backButton.nextSibling);
          } else if (backButton) {
            appNavigation.appendChild(titleElement);
          } else {
            appNavigation.insertBefore(titleElement, appNavigation.firstChild);
          }
        }
      }, 100);
    };

    extend('flarum/forum/components/PostStream', 'oncreate', function () {
      const blogHeaderEnabled = app.forum?.attribute?.('stickyTitleBlogHeader') ?? true;

      if (blogHeaderEnabled && app.current?.get?.('routeName')?.startsWith('blogArticle')) {
        addTitleToHeader(this.attrs.discussion);
      } else {
        cleanupStickyTitle();
      }
    });

    extend('flarum/forum/components/PostStream', 'onupdate', function () {
      const blogHeaderEnabled = app.forum?.attribute?.('stickyTitleBlogHeader') ?? true;

      if (blogHeaderEnabled && app.current?.get?.('routeName')?.startsWith('blogArticle')) {
        addTitleToHeader(this.attrs.discussion);
      }
    });

    extend('flarum/forum/components/PostStream', 'onremove', function () {
      cleanupStickyTitle();
      cleanupPageTitle();
    });

    extend(Page.prototype, 'oncreate', function () {
      if (isFofPage()) {
        addPageTitle();
      } else {
        cleanupPageTitle();
      }
    });

    extend(Page.prototype, 'onupdate', function () {
      if (isFofPage()) {
        addPageTitle();
      } else {
        cleanupPageTitle();
      }
    });
  }

  let lastScrollTop = 0;
  let scrollHandler = null;

  extend('flarum/forum/components/PostStreamScrubber', 'oninit', function (vnode) {
    this.showingTitle = false;
    const discussion = this.attrs.stream.discussion;
    if (discussion && this.lastDiscussionId !== discussion.id()) {
      this.lastDiscussionId = discussion.id();
      this.showingTitle = false;
      lastScrollTop = 0;
    }
  });

  extend('flarum/forum/components/PostStreamScrubber', 'view', function (vnode) {
    if (window.innerWidth > 767) return;
    const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
    if (mobileScrollDirection === 'never' || !this.attrs.stream.discussion) return;
    if (vnode && vnode.attrs) {
      vnode.attrs.className = (vnode.attrs.className || '') + (this.showingTitle ? ' showing-title' : '');
    }
  });

  extend('flarum/forum/components/PostStreamScrubber', 'oncreate', function (vnode) {
    if (window.innerWidth <= 767) {
      const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
      if (mobileScrollDirection !== 'never') {
        const discussion = this.attrs.stream.discussion;
        if (discussion) {
          const button = this.element.querySelector('.Dropdown-toggle');
          if (button && !button.querySelector('.MobileStickyTitle')) {
            const originalContentSpan = document.createElement('span');
            originalContentSpan.className = 'MobileOriginalContent';

            while (button.firstChild) {
              originalContentSpan.appendChild(button.firstChild);
            }

            const titleSpan = document.createElement('span');
            titleSpan.className = 'MobileStickyTitle';
            titleSpan.textContent = discussion.title();

            button.appendChild(originalContentSpan);
            button.appendChild(titleSpan);
          }
          if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
          scrollHandler = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            let shouldShowTitle = false;
            if (
              (mobileScrollDirection === 'always' ||
                (mobileScrollDirection === 'scroll_down' && scrollDirection === 'down') ||
                (mobileScrollDirection === 'scroll_up' && scrollDirection === 'up')) &&
              scrollTop > 100
            ) {
              shouldShowTitle = true;
            }
            if (this.showingTitle !== shouldShowTitle) {
              this.showingTitle = shouldShowTitle;
              this.element.classList.toggle('showing-title', shouldShowTitle);
            }
          };
          window.addEventListener('scroll', scrollHandler);
          this.scrollHandler = scrollHandler;
        }
      }
    }

    updateScrubberTitle(this.element, this.attrs.stream.discussion);
  });

  extend('flarum/forum/components/PostStreamScrubber', 'onupdate', function (vnode) {
    if (window.innerWidth <= 767) {
      const discussion = this.attrs.stream.discussion;
      if (discussion) {
        const titleSpan = this.element.querySelector('.MobileStickyTitle');
        if (titleSpan && titleSpan.textContent !== discussion.title()) {
          titleSpan.textContent = discussion.title();
        }
      }
    }

    updateScrubberTitle(this.element, this.attrs.stream.discussion);
  });

  extend('flarum/forum/components/PostStreamScrubber', 'onremove', function () {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  });

  extend(DiscussionPage.prototype, 'sidebarItems', function (items) {
    const showWebTitle = app.forum.attribute('stickyTitleWebScrubber');
    if (!showWebTitle || window.innerWidth <= 767) return;
    const discussion = this.discussion;
    if (!discussion) return;

    const scrollToFirst = () => this.stream && this.stream.goToFirst();
    const tagColorStyle = app.forum.attribute('stickyTitleTagColorStyle') || 'background';

    const recipientUsers = discussion.recipientUsers?.() || null;
    const recipientGroups = discussion.recipientGroups?.() || null;
    const isByobuDiscussion = (recipientUsers && recipientUsers.length > 0) || (recipientGroups && recipientGroups.length > 0);

    const tags = discussion.tags?.() || null;

    items.add(
      'sticky-title',
      m('.StickyTitlePanel', [
        m('.StickyTitlePanel-container', { onclick: scrollToFirst, style: 'cursor: pointer;' }, [
          m('.StickyTitlePanel-header', [m('.StickyTitlePanel-label', discussion.title())]),
          m('.StickyTitlePanel-content', [
            isByobuDiscussion
              ? m('.StickyTitlePanel-recipients', [
                  recipientUsers && recipientUsers.length > 0
                    ? m(
                        '.StickyTitlePanel-users',
                        recipientUsers.map((user) => {
                          const baseColor = '#3498db';
                          let styleString = '';

                          if (tagColorStyle === 'background') {
                            styleString = `background-color: ${baseColor}; color: #fff; border: none;`;
                          } else if (tagColorStyle === 'text') {
                            styleString = `color: ${baseColor}; background-color: transparent; border: 1px solid var(--control-bg);`;
                          } else if (tagColorStyle === 'border') {
                            styleString = `border: 2px solid ${baseColor}; color: var(--text-color); background-color: transparent;`;
                          }

                          return m(
                            Link,
                            {
                              key: user.id(),
                              href: app.route('user', { username: user.username() }),
                              className: 'RecipientLabel RecipientLabel--user',
                              style: styleString,
                              onclick: (e) => e.stopPropagation(),
                            },
                            [m('i.fas.fa-user.RecipientLabel-icon'), m('span.RecipientLabel-text', user.displayName())]
                          );
                        })
                      )
                    : null,
                  recipientGroups && recipientGroups.length > 0
                    ? m(
                        '.StickyTitlePanel-groups',
                        recipientGroups.map((group) => {
                          const baseColor = '#9b59b6';
                          let styleString = '';

                          if (tagColorStyle === 'background') {
                            styleString = `background-color: ${baseColor}; color: #fff; border: none;`;
                          } else if (tagColorStyle === 'text') {
                            styleString = `color: ${baseColor}; background-color: transparent; border: 1px solid var(--control-bg);`;
                          } else if (tagColorStyle === 'border') {
                            styleString = `border: 2px solid ${baseColor}; color: var(--text-color); background-color: transparent;`;
                          }

                          return m(
                            'span.RecipientLabel.RecipientLabel--group',
                            {
                              key: group.id(),
                              style: styleString,
                            },
                            [m('i.fas.fa-users.RecipientLabel-icon'), m('span.RecipientLabel-text', group.namePlural())]
                          );
                        })
                      )
                    : null,
                ])
              : tags && tags.length > 0
                ? m(
                    '.StickyTitlePanel-tags',
                    { className: `tag-style-${tagColorStyle}` },
                    tags.map((tag) => {
                      let styleString = '';
                      const className = ['TagLabel', tag.isChild() && 'TagLabel--child'].filter(Boolean);
                      const color = tag.color() || '#888';
                      if (tagColorStyle === 'background') {
                        styleString = `background-color: ${color}; color: #fff; border: none;`;
                      } else if (tagColorStyle === 'text') {
                        styleString = `color: ${color}; background-color: transparent; border: 1px solid var(--control-bg);`;
                      } else if (tagColorStyle === 'border') {
                        styleString = `border: 2px solid ${color}; color: var(--text-color); background-color: transparent;`;
                      }

                      return m(
                        Link,
                        {
                          href: app.route('tag', { tags: tag.slug() }),
                          style: styleString,
                          className: className.join(' '),
                          onclick: (e) => e.stopPropagation(),
                        },
                        [tag.icon() && m('span.TagLabel-icon', m('i', { className: tag.icon() })), m('span.TagLabel-text', tag.name())]
                      );
                    })
                  )
                : m('.StickyTitlePanel-meta', [
                    m('span.StickyTitlePanel-arrow', m('i.fas.fa-arrow-up')),
                    m('span', app.translator.trans('core.forum.post_scrubber.original_post_link')),
                  ]),
          ]),
        ]),
      ]),
      1
    );
  });
});
