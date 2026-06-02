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

return [
    (new Extend\Frontend('forum'))
        ->js(__DIR__.'/js/dist/forum.js')
        ->css(__DIR__.'/less/forum.less'),
    
    (new Extend\Frontend('admin'))
        ->js(__DIR__.'/js/dist/admin.js'),
    
    new Extend\Locales(__DIR__.'/locale'),
    
    (new Extend\Settings())
        ->default('huseyinfiliz-sticky-title.mobile_scroll_direction', 'always')
        ->serializeToForum('stickyTitleMobileScroll', 'huseyinfiliz-sticky-title.mobile_scroll_direction')
        
        ->default('huseyinfiliz-sticky-title.scrubber_replace_original', 'both')
        ->serializeToForum('stickyTitleScrubberReplace', 'huseyinfiliz-sticky-title.scrubber_replace_original')
        
        ->default('huseyinfiliz-sticky-title.web_scrubber_title', true)
        ->serializeToForum('stickyTitleWebScrubber', 'huseyinfiliz-sticky-title.web_scrubber_title', 'boolval')
        
        ->default('huseyinfiliz-sticky-title.tag_color_style', 'background')
        ->serializeToForum('stickyTitleTagColorStyle', 'huseyinfiliz-sticky-title.tag_color_style')
        
        ->default('huseyinfiliz-sticky-title.fof_pages_header', true)
        ->serializeToForum('stickyTitleFofPagesHeader', 'huseyinfiliz-sticky-title.fof_pages_header', 'boolval')
        
        ->default('huseyinfiliz-sticky-title.blog_header', true)
        ->serializeToForum('stickyTitleBlogHeader', 'huseyinfiliz-sticky-title.blog_header', 'boolval'),
];