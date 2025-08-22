import { extend, override } from 'flarum/common/extend';
import PostStreamScrubber from 'flarum/forum/components/PostStreamScrubber';
import DiscussionPage from 'flarum/forum/components/DiscussionPage';

app.initializers.add('huseyinfiliz/sticky-title', () => {
  console.log('[huseyinfiliz/sticky-title] Forum loaded');
  
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
    // Mobil kontrol
    if (window.innerWidth > 767) return;
    
    const mobileScrollDirection = app.forum.attribute('stickyTitleMobileScroll');
    if (mobileScrollDirection === 'never') return;
    
    const discussion = this.attrs.stream.discussion;
    if (!discussion) return;
    
    // Button içeriğini wrap et
    const button = this.element.querySelector('.Dropdown-toggle');
    if (button && !button.querySelector('.MobileStickyTitle')) {
      // Orijinal içeriği wrap et
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
  });
  
  extend(PostStreamScrubber.prototype, 'onremove', function() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      this.scrollHandler = null;
    }
  });
  
  // Scrubber'da "Original Post" / "İlk Gönderi" yerine tartışma başlığını göster
  extend(PostStreamScrubber.prototype, 'oncreate', function(vnode) {
    // Admin panel'den ayarı kontrol et
    const replaceNow = app.forum.attribute('stickyTitleScrubberReplace');
    
    if (!replaceNow) return;
    
    // Mevcut tartışmayı al
    const discussion = this.attrs.stream.discussion;
    
    if (!discussion) return;
    
    // DOM hazır olduğunda elementi bul ve değiştir
    const scrubberFirst = this.element.querySelector('.Scrubber-first');
    
    if (scrubberFirst) {
      // Icon'u koru
      const icon = scrubberFirst.querySelector('i');
      
      // İçeriği temizle ve yeniden oluştur
      scrubberFirst.innerHTML = '';
      
      if (icon) {
        scrubberFirst.appendChild(icon.cloneNode(true));
        scrubberFirst.appendChild(document.createTextNode(' '));
      }
      
      // Başlık span'ini ekle
      const titleSpan = document.createElement('span');
      titleSpan.className = 'ScrubberTitle';
      titleSpan.textContent = discussion.title();
      titleSpan.title = discussion.title();
      
      scrubberFirst.appendChild(titleSpan);
    }
  });
  
  // Scrubber güncellendiğinde de çalıştır
  extend(PostStreamScrubber.prototype, 'onupdate', function(vnode) {
    const replaceNow = app.forum.attribute('stickyTitleScrubberReplace');
    
    if (!replaceNow) return;
    
    const discussion = this.attrs.stream.discussion;
    
    if (!discussion) return;
    
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
  });
  
  // Desktop'ta sidebar'a tartışma başlığı item'ı ekle
  extend(DiscussionPage.prototype, 'sidebarItems', function(items) {
    // Admin panel'den ayarı kontrol et
    const showWebTitle = app.forum.attribute('stickyTitleWebScrubber');
    
    if (!showWebTitle) return;
    
    // Sadece desktop'ta göster
    if (window.innerWidth <= 767) return;
    
    const discussion = this.discussion;
    
    if (!discussion) return;
    
    // İlk posta gitme fonksiyonu
    const scrollToFirst = () => {
      const stream = this.stream;
      if (stream) {
        stream.goToNumber(1);
      }
    };
    
    // Tartışmanın etiketlerini al
    const tags = discussion.tags();
    
    // Tartışma başlığı item'ını ekle
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
              m('.StickyTitlePanel-tags', 
                tags.map(tag => 
                  m('span.TagLabel', {
                    style: tag.color() ? `background-color: ${tag.color()};` : '',
                    className: tag.isChild() ? 'TagLabel--child' : ''
                  }, [
                    tag.icon() ? m('span.TagLabel-icon', m('i', { className: tag.icon() })) : null,
                    m('span.TagLabel-text', tag.name())
                  ])
                )
              ) : 
              m('.StickyTitlePanel-meta', [
                m('span.StickyTitlePanel-arrow', m('i.fas.fa-arrow-up')),
                m('span', app.translator.trans('core.forum.post_scrubber.original_post_link'))
              ])
          ])
        ])
      ]),
      1 // Scrubber'ın priority'si 100, onun hemen üstünde olsun
    );
  });
});