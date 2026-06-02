import app from 'flarum/admin/app';

app.initializers.add('huseyinfiliz/sticky-title', function() {
  app.extensionData
    .for('huseyinfiliz-sticky-title')
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.mobile_scroll_direction',
      type: 'dropdown',
      label: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.mobile_scroll_label'),
      help: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.mobile_scroll_help'),
      options: {
        always: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.mobile_scroll_options.always'),
        scroll_down: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.mobile_scroll_options.scroll_down'),
        scroll_up: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.mobile_scroll_options.scroll_up'),
        never: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.mobile_scroll_options.never')
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.scrubber_replace_original',
      type: 'dropdown',
      label: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.scrubber_replace_original_label'),
      help: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.scrubber_replace_original_help'),
      options: {
        never: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.scrubber_replace_options.never'),
        mobile: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.scrubber_replace_options.mobile'),
        desktop: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.scrubber_replace_options.desktop'),
        both: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.scrubber_replace_options.both')
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.web_scrubber_title',
      type: 'boolean',
      label: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.web_scrubber_title_label'),
      help: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.web_scrubber_title_help')
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.tag_color_style',
      type: 'dropdown',
      label: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.tag_color_style_label'),
      help: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.tag_color_style_help'),
      options: {
        background: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.tag_color_style_options.background'),
        text: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.tag_color_style_options.text'),
        border: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.tag_color_style_options.border')
      }
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.fof_pages_header',
      type: 'boolean',
      label: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.fof_pages_header_label'),
      help: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.fof_pages_header_help')
    })
    .registerSetting({
      setting: 'huseyinfiliz-sticky-title.blog_header',
      type: 'boolean',
      label: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.blog_header_label'),
      help: app.translator.trans('huseyinfiliz-sticky-title.admin.settings.blog_header_help')
    });
});