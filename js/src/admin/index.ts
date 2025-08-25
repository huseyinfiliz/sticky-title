app.initializers.add('huseyinfiliz/sticky-title', function() {
  console.log('[huseyinfiliz/sticky-title] Admin panel loaded');
  
  app.extensionData
    .for('huseyinfiliz-sticky-title')
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.mobile_scroll_direction',
      type: 'dropdown',
      label: 'Mobile Discussion Title Display',
      help: 'Choose when to show the discussion title in the mobile header',
      options: {
        always: 'Always Show',
        scroll_down: 'Show When Scrolling Down',
        scroll_up: 'Show When Scrolling Up',
        never: 'Never Show'
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.scrubber_replace_original',
      type: 'dropdown',
      label: 'Replace "Original Post" with Discussion Title',
      help: 'Choose where to show the discussion title instead of "Original Post"',
      options: {
        never: 'Never Replace',
        mobile: 'Mobile Only',
        desktop: 'Desktop Only',
        both: 'Both Mobile & Desktop'
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.web_scrubber_title',
      type: 'boolean',
      label: 'Show Title Above Scrubber',
      help: 'Displays the discussion title above the scrubber on desktop'
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.tag_color_style',
      type: 'dropdown',
      label: 'Tag Color Style',
      help: 'Choose how tag colors are displayed in the sidebar panel',
      options: {
        background: 'Background Color (Default)',
        text: 'Text Color Only',
        border: 'Border Color Only'
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.fof_pages_header',
      type: 'boolean',
      label: 'Show Page Title in Mobile Header',
      help: 'Displays the page title in mobile header when viewing FoF Pages'
    });
});