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
        
        // Scrubber'da "Now" yerine başlık gösterimi - varsayılan: true
        ->default('huseyinfiliz-sticky-title.scrubber_replace_now', true)
        ->serializeToForum('stickyTitleScrubberReplace', 'huseyinfiliz-sticky-title.scrubber_replace_now', 'boolval')
        
        // Web'de scrubber üstünde başlık gösterimi - varsayılan: true
        ->default('huseyinfiliz-sticky-title.web_scrubber_title', true)
        ->serializeToForum('stickyTitleWebScrubber', 'huseyinfiliz-sticky-title.web_scrubber_title', 'boolval'),
];