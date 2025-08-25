<?php
/*
 * This file is part of huseyinfiliz/sticky-title.
 *
 * Copyright (c) 2025 Hüseyin Filiz.
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */
namespace HuseyinFiliz\StickyTitle;

use Flarum\Extend;
use Flarum\Settings\SettingsRepositoryInterface;

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),
    
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js')
        ->css(__DIR__.'/less/admin.less'),
    
    new Extend\Locales(__DIR__.'/locale'),
    
    (new Extend\Settings())
        // Mobil scroll ayarı - varsayılan: 'always'
        ->default('huseyinfiliz-sticky-title.mobile_scroll_direction', 'always')
        ->serializeToForum('stickyTitleMobileScroll', 'huseyinfiliz-sticky-title.mobile_scroll_direction')
        
        // Scrubber'da "Original Post" yerine başlık gösterimi - varsayılan: 'both'
        ->default('huseyinfiliz-sticky-title.scrubber_replace_original', 'both')
        ->serializeToForum('stickyTitleScrubberReplace', 'huseyinfiliz-sticky-title.scrubber_replace_original')
        
        // Web'de scrubber üstünde başlık gösterimi - varsayılan: true
        ->default('huseyinfiliz-sticky-title.web_scrubber_title', true)
        ->serializeToForum('stickyTitleWebScrubber', 'huseyinfiliz-sticky-title.web_scrubber_title', 'boolval')
        
        // Tag renk stili - varsayılan: 'background'
        ->default('huseyinfiliz-sticky-title.tag_color_style', 'background')
        ->serializeToForum('stickyTitleTagColorStyle', 'huseyinfiliz-sticky-title.tag_color_style')
        
        // FoF Pages header başlık - varsayılan: true
        ->default('huseyinfiliz-sticky-title.fof_pages_header', true)
        ->serializeToForum('stickyTitleFofPagesHeader', 'huseyinfiliz-sticky-title.fof_pages_header', 'boolval'),
];