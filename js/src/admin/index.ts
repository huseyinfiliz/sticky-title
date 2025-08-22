app.initializers.add('huseyinfiliz/sticky-title', () => {
  app.extensionData
    .for('huseyinfiliz-sticky-title')
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.mobile_scroll_direction',
      type: 'dropdown',
      label: 'Mobile Discussion Title Display',
      help: 'Choose when to show the discussion title in mobile header',
      options: {
        'always': 'Always Show',
        'scroll_down': 'Show When Scrolling Down',
        'scroll_up': 'Show When Scrolling Up',
        'never': 'Never Show'
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.scrubber_replace_now',
      type: 'boolean',
      label: 'Replace "Now" with Discussion Title',
      help: 'Shows discussion title instead of "Now" in scrubber'
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.web_scrubber_title',
      type: 'boolean',
      label: 'Show Title Above Scrubber',
      help: 'Shows discussion title above scrubber on desktop'
    });
});