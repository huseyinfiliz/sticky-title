import { extend, override } from 'flarum/common/extend';
import PostStreamScrubber from 'flarum/forum/components/PostStreamScrubber';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';

app.initializers.add('huseyinfiliz/sticky-title', () => {
  console.log('[huseyinfiliz/sticky-title] Forum loaded');
  
  // FoF Pages desteği - Mobilde sayfa başlığını header'a ekle
  if (window.innerWidth <= 767) {
    // Route değişimlerini dinle
    const addPageTitle = () => {
      // app.forum hazır değilse çık
      if (!app.forum || !app.forum.attribute) return;
      
      // Ayarı kontrol et
      const fofPagesEnabled = app.forum.attribute('stickyTitleFofPagesHeader');
      
      // Ayar kapalıysa veya tanımlı değilse varsayılan olarak true kabul et
      if (fofPagesEnabled === false) return;
      
      // FoF Pages sayfasında mıyız? (route name: 'page')
      if (app.current && app.current.get && app.current.get('routeName') === 'page') {
        setTimeout(() => {
          // Sayfa başlığını bul - PageHero-title selector'ü ekle
          const pageTitle = document.querySelector('.PageHero-title, h1.PageHero-title');
          const appNavigation = document.querySelector('#app-navigation .Navigation');
          
          console.log('[StickyTitle] Page title found:', pageTitle?.textContent);
          console.log('[StickyTitle] Navigation found:', !!appNavigation);
          
          if (pageTitle && appNavigation) {
            // Başlık zaten eklenmişse ekleme
            if (!appNavigation.querySelector('.PageTitle')) {
              // Back button'dan sonra başlık ekle
              const titleElement = document.createElement('div');
              titleElement.className = 'PageTitle Navigation-title';
              titleElement.textContent = pageTitle.textContent.trim();
              
              // Back button'dan sonra ekle
              const backButton = appNavigation.querySelector('.Navigation-back');
              if (backButton) {
                backButton.parentNode.insertBefore(titleElement, backButton.nextSibling);
                console.log('[StickyTitle] Title added to navigation');
              } else {
                appNavigation.appendChild(titleElement);
              }
            }
          }
        }, 1); // Sayfa render'ını bekle
      }
    };
    
    // İlk yüklemeyi geciktir
    setTimeout(addPageTitle, 1);
    
    // History değişimlerini dinle (sayfa geçişleri için)
    const originalPushState = history.pushState;
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      addPageTitle();
    };
    
    // Popstate (geri/ileri butonları)
    window.addEventListener('popstate', addPageTitle);
    
    // m.route değişimlerini dinle
    if (m && m.route) {
      const originalRoute = m.route.set;
      m.route.set = function() {
        const result = originalRoute.apply(m.route, arguments);
        setTimeout(addPageTitle, 1);
        return result;
      };
    }
    
    // Sayfa yüklendiğinde tekrar dene
    document.addEventListener('DOMContentLoaded', () => setTimeout(addPageTitle, 1));
    window.addEventListener('load', () => setTimeout(addPageTitle, 1));
  }
  
  // Mobil header'da scroll'a göre başlık gösterimi
  let lastScrollTop = 0;
  let scrollHandler = null;
  
  extend(PostStreamScrubber.prototype, 'oninit', function(vnode) {
    this.showingTitle = false;
    // Discussion değiştiğinde state'i sıfırla
    const discussion = this.attrs.stream.discussion;
    if (discussion && this.lastDiscussionId !== discussion.id()) {
      this.lastDiscussionId = discussion.id();
      this.showingTitle = false;
      lastScrollTop = 0;
    }
  });
  
  extend(PostStreamScrubber.prototype, 'view', function(vnode) {
    // Mobil kontrol
    if (window.innerWidth > 767) return;
    
    const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
    if (mobileScrollDirection === 'never') return;
    
    const discussion = this.attrs.stream.discussion;
    if (!discussion) return;
    
    // Component'e class ekle
    if (vnode && vnode.attrs) {
      vnode.attrs.className = (vnode.attrs.className || '') + (this.showingTitle ? ' showing-title' : '');
    }
  });
  
  extend(PostStreamScrubber.prototype, 'oncreate', function(vnode) {
    // Mobil header kontrolü
    if (window.innerWidth <= 767) {
      const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
      if (mobileScrollDirection !== 'never') {
        const discussion = this.attrs.stream.discussion;
        if (discussion) {
          // Button içeriğini wrap et
          const button = this.element.querySelector('.Dropdown-toggle');
          if (button && !button.querySelector('.MobileStickyTitle')) {
            const originalHTML = button.innerHTML;
            button.innerHTML = `
              <span class="MobileOriginalContent">${originalHTML}</span>
              <span class="MobileStickyTitle">${discussion.title()}</span>
            `;
          }
          
          // Önceki handler'ı temizle
          if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
          }
          
          // Yeni scroll handler
          scrollHandler = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
            lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
            
            let shouldShowTitle = false;
            
            if (mobileScrollDirection === 'always' && scrollTop > 100) {
              shouldShowTitle = true;
            } else if (mobileScrollDirection === 'scroll_down' && scrollDirection === 'down' && scrollTop > 100) {
              shouldShowTitle = true;
            } else if (mobileScrollDirection === 'scroll_up' && scrollDirection === 'up' && scrollTop > 100) {
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
    
    // Scrubber "Original Post" değiştirme - Platform kontrolü ekle
    const replaceOriginal = app.forum.attribute('stickyTitleScrubberReplace');
    const isMobile = window.innerWidth <= 767;
    
    let shouldReplace = false;
    if (replaceOriginal === 'both') {
      shouldReplace = true;
    } else if (replaceOriginal === 'mobile' && isMobile) {
      shouldReplace = true;
    } else if (replaceOriginal === 'desktop' && !isMobile) {
      shouldReplace = true;
    }
    
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
  
  extend(PostStreamScrubber.prototype, 'onupdate', function(vnode) {
    // Scrubber güncellendiğinde de platform kontrolü yap
    const replaceOriginal = app.forum.attribute('stickyTitleScrubberReplace');
    const isMobile = window.innerWidth <= 767;
    
    let shouldReplace = false;
    if (replaceOriginal === 'both') {
      shouldReplace = true;
    } else if (replaceOriginal === 'mobile' && isMobile) {
      shouldReplace = true;
    } else if (replaceOriginal === 'desktop' && !isMobile) {
      shouldReplace = true;
    }
    
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
  
  extend(PostStreamScrubber.prototype, 'onremove', function() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  });
  
  // Desktop'ta sidebar'a tartışma başlığı item'ı ekle
  extend(DiscussionPage.prototype, 'sidebarItems', function(items) {
    const showWebTitle = app.forum.attribute('stickyTitleWebScrubber');
    
    if (!showWebTitle) return;
    
    if (window.innerWidth <= 767) return;
    
    const discussion = this.discussion;
    
    if (!discussion) return;
    
    const scrollToFirst = () => {
      const stream = this.stream;
      if (stream) {
        stream.goToNumber(1);
      }
    };
    
    const tags = discussion.tags();
    const tagColorStyle = app.forum.attribute('stickyTitleTagColorStyle') || 'background';
    
    items.add('sticky-title',
      m('.StickyTitlePanel', [
        m('.StickyTitlePanel-container', {
          onclick: scrollToFirst,
          style: 'cursor: pointer;'
        }, [
          m('.StickyTitlePanel-header', [
            m('.StickyTitlePanel-label', discussion.title())
          ]),
          m('.StickyTitlePanel-content', [
            tags && tags.length > 0 ? 
              m('.StickyTitlePanel-tags', {
                className: `tag-style-${tagColorStyle}`
              },
                tags.map(tag => {
                  const style = {};
                  const className = ['TagLabel'];
                  
                  if (tag.isChild()) {
                    className.push('TagLabel--child');
                  }
                  
                  // Tag renk stili
                  if (tagColorStyle === 'background') {
                    style.backgroundColor = tag.color() || '#888';
                    style.color = '#fff';
                  } else if (tagColorStyle === 'text') {
                    style.color = tag.color() || '#888';
                    style.backgroundColor = 'transparent';
                    style.border = '1px solid currentColor';
                  } else if (tagColorStyle === 'border') {
                    style.borderColor = tag.color() || '#888';
                    style.border = `2px solid ${tag.color() || '#888'}`;
                    style.color = tag.color() || '#888';
                    style.backgroundColor = 'transparent';
                  }
                  
                  return m('span.TagLabel', {
                    style: Object.keys(style).map(k => `${k}: ${style[k]}`).join('; '),
                    className: className.join(' ')
                  }, [
                    tag.icon() ? m('span.TagLabel-icon', m('i', { className: tag.icon() })) : null,
                    m('span.TagLabel-text', tag.name())
                  ]);
                })
              ) : 
              m('.StickyTitlePanel-meta', [
                m('span.StickyTitlePanel-arrow', m('i.fas.fa-arrow-up')),
                m('span', app.translator.trans('core.forum.post_scrubber.original_post_link'))
              ])
          ])
        ])
      ]),
      1
    );
  });
});