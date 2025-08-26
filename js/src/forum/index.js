import { extend } from 'flarum/common/extend';
import PostStreamScrubber from 'flarum/forum/components/PostStreamScrubber';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';
import PostStream from 'flarum/forum/components/PostStream';

app.initializers.add('huseyinfiliz-sticky-title', () => {
  console.log('[huseyinfiliz/sticky-title] Forum loaded');

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

        if (titleControlButton.querySelector('.PageTitle-container')) return;

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

	extend(PostStream.prototype, 'oncreate', function () {
  	// Blog header ayarını kontrol et
  	const blogHeaderEnabled = app.forum && app.forum.attribute ? 
    	app.forum.attribute('stickyTitleBlogHeader') : true;
  
  	if (blogHeaderEnabled && app.current && app.current.get('routeName')?.startsWith('blogArticle')) {
    	addTitleToHeader(this.attrs.discussion);
  	}
	});

    extend(PostStream.prototype, 'onremove', function () {
      cleanupStickyTitle();
    });
  }

  let lastScrollTop = 0;
  let scrollHandler = null;

  extend(PostStreamScrubber.prototype, 'oninit', function (vnode) {
    this.showingTitle = false;
    const discussion = this.attrs.stream.discussion;
    if (discussion && this.lastDiscussionId !== discussion.id()) {
      this.lastDiscussionId = discussion.id();
      this.showingTitle = false;
      lastScrollTop = 0;
    }
  });

  extend(PostStreamScrubber.prototype, 'view', function (vnode) {
    if (window.innerWidth > 767) return;
    const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
    if (mobileScrollDirection === 'never' || !this.attrs.stream.discussion) return;
    if (vnode && vnode.attrs) {
      vnode.attrs.className = (vnode.attrs.className || '') + (this.showingTitle ? ' showing-title' : '');
    }
  });

  extend(PostStreamScrubber.prototype, 'oncreate', function (vnode) {
    if (window.innerWidth <= 767) {
      const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
      if (mobileScrollDirection !== 'never') {
        const discussion = this.attrs.stream.discussion;
        if (discussion) {
          const button = this.element.querySelector('.Dropdown-toggle');
          if (button && !button.querySelector('.MobileStickyTitle')) {
            const originalHTML = button.innerHTML;
            button.innerHTML = `<span class="MobileOriginalContent">${originalHTML}</span><span class="MobileStickyTitle">${discussion.title()}</span>`;
          }
          if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
          scrollHandler = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            let shouldShowTitle = false;
            if ((mobileScrollDirection === 'always' || (mobileScrollDirection === 'scroll_down' && scrollDirection === 'down') || (mobileScrollDirection === 'scroll_up' && scrollDirection === 'up')) && scrollTop > 100) {
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

    const replaceOriginal = app.forum.attribute('stickyTitleScrubberReplace');
    const isMobile = window.innerWidth <= 767;
    let shouldReplace = (replaceOriginal === 'both') || (replaceOriginal === 'mobile' && isMobile) || (replaceOriginal === 'desktop' && !isMobile);
    if (shouldReplace) {
      const discussion = this.attrs.stream.discussion;
      if (discussion) {
        const scrubberFirst = this.element.querySelector('.Scrubber-first');
        if (scrubberFirst) {
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
    }
  });

  extend(PostStreamScrubber.prototype, 'onupdate', function (vnode) {
    const replaceOriginal = app.forum.attribute('stickyTitleScrubberReplace');
    const isMobile = window.innerWidth <= 767;
    let shouldReplace = (replaceOriginal === 'both') || (replaceOriginal === 'mobile' && isMobile) || (replaceOriginal === 'desktop' && !isMobile);
    if (shouldReplace) {
      const discussion = this.attrs.stream.discussion;
      if (discussion) {
        const scrubberFirst = this.element.querySelector('.Scrubber-first');
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
    }
  });

  extend(PostStreamScrubber.prototype, 'onremove', function () {
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

    const scrollToFirst = () => this.stream && this.stream.goToNumber(1);
    const tags = discussion.tags();
    const tagColorStyle = app.forum.attribute('stickyTitleTagColorStyle') || 'background';

    items.add('sticky-title',
      m('.StickyTitlePanel', [
        m('.StickyTitlePanel-container', { onclick: scrollToFirst, style: 'cursor: pointer;' }, [
          m('.StickyTitlePanel-header', [m('.StickyTitlePanel-label', discussion.title())]),
          m('.StickyTitlePanel-content', [
            tags && tags.length > 0
              ? m('.StickyTitlePanel-tags', { className: `tag-style-${tagColorStyle}` },
                  tags.map(tag => {
                    let styleString = '';
                    const className = ['TagLabel', tag.isChild() && 'TagLabel--child'].filter(Boolean);
                    const color = tag.color() || '#888';
                    if (tagColorStyle === 'background') {
                      styleString = `background-color: ${color} !important; color: #fff !important; border: none !important;`;
                    } else if (tagColorStyle === 'text') {
                      styleString = `color: ${color} !important; background-color: transparent !important; border: 1px solid var(--control-bg) !important;`;
                    } else if (tagColorStyle === 'border') {
                      styleString = `border: 2px solid ${color} !important; color: var(--text-color) !important; background-color: transparent !important;`;
                    }
                    return m('span.TagLabel', { style: styleString, className: className.join(' ') }, [
                      tag.icon() && m('span.TagLabel-icon', m('i', { className: tag.icon() })),
                      m('span.TagLabel-text', tag.name())
                    ]);
                  })
                )
              : m('.StickyTitlePanel-meta', [
                  m('span.StickyTitlePanel-arrow', m('i.fas.fa-arrow-up')),
                  m('span', app.translator.trans('core.forum.post_scrubber.original_post_link'))
                ])
          ])
        ])
      ]), 1
    );
  });
});