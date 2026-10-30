'use strict';
// 纯 SVG 手绘雨林小伙伴，无外部图片资源，离线可用。
const FOREST_FRIENDS=`<div class="animal-group" aria-hidden="true">
  <svg class="friend friend-frog" viewBox="0 0 170 165" role="presentation">
    <ellipse cx="86" cy="151" rx="77" ry="11" fill="#bbef98" opacity=".45"/>
    <path d="M22 148Q84 125 150 146Q103 158 22 148Z" fill="#70c27f" stroke="#366d5d" stroke-width="3"/>
    <ellipse cx="83" cy="111" rx="55" ry="41" fill="#81db8b" stroke="#2b835c" stroke-width="3"/>
    <circle cx="48" cy="76" r="25" fill="#8be68d" stroke="#2b835c" stroke-width="3"/>
    <circle cx="117" cy="76" r="25" fill="#8be68d" stroke="#2b835c" stroke-width="3"/>
    <circle cx="47" cy="76" r="15" fill="#f9fbe9"/><circle cx="118" cy="76" r="15" fill="#f9fbe9"/>
    <circle cx="52" cy="78" r="8" fill="#304c50"/><circle cx="122" cy="78" r="8" fill="#304c50"/>
    <circle cx="54" cy="74" r="3" fill="white"/><circle cx="124" cy="74" r="3" fill="white"/>
    <ellipse cx="60" cy="117" rx="13" ry="7" fill="#fb9d9e" opacity=".84"/>
    <ellipse cx="108" cy="117" rx="13" ry="7" fill="#fb9d9e" opacity=".84"/>
    <path d="M70 121Q83 133 96 121" stroke="#386c56" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M53 133Q20 138 30 148M115 133Q149 138 141 149" fill="none" stroke="#418a69" stroke-width="7" stroke-linecap="round"/>
    <path d="M140 47Q145 37 152 40Q158 48 147 54Z" fill="#ffe6a0"/>
  </svg>
  <svg class="friend friend-toucan" viewBox="0 0 205 210" role="presentation">
    <path d="M72 201Q106 165 150 191L165 205Z" fill="#4cb499" opacity=".65"/>
    <path d="M100 179Q93 199 87 201M119 180Q119 199 126 202" stroke="#e6a25c" stroke-width="7" stroke-linecap="round"/>
    <ellipse cx="106" cy="119" rx="51" ry="68" transform="rotate(-10 106 119)" fill="#285b72" stroke="#153d47" stroke-width="4"/>
    <ellipse cx="115" cy="124" rx="28" ry="52" transform="rotate(-13 115 124)" fill="#f8e8b2"/>
    <path d="M71 64Q47 55 39 67Q23 83 47 103Q80 115 95 89Z" fill="#375c65"/>
    <ellipse cx="103" cy="65" rx="35" ry="31" fill="#2d5161"/>
    <path d="M99 53Q145 18 193 55Q172 84 109 81Z" fill="#ffbc54" stroke="#c77b4d" stroke-width="3"/>
    <path d="M109 72Q153 58 188 56" stroke="#ffe3a8" stroke-width="6" stroke-linecap="round"/>
    <circle cx="98" cy="56" r="11" fill="#fff5d5"/><circle cx="101" cy="56" r="5" fill="#1e464f"/><circle cx="103" cy="53" r="2" fill="white"/>
    <path d="M72 133Q38 140 48 176L77 156" fill="#335b7d" stroke="#21485c" stroke-width="3"/>
    <path d="M67 173L55 203" stroke="#285b72" stroke-width="10" stroke-linecap="round"/>
    <path d="M29 202Q91 193 183 203" stroke="#5ba977" stroke-width="8" stroke-linecap="round"/>
  </svg>
  <svg class="friend friend-butterfly" viewBox="0 0 120 100" role="presentation">
    <path d="M59 51Q34 -5 10 20Q-1 48 52 58Q14 55 23 84Q38 99 59 61Z" fill="#a9c9ff" stroke="#567ca6" stroke-width="2"/>
    <path d="M61 51Q86 -5 110 20Q121 48 68 58Q106 55 97 84Q82 99 61 61Z" fill="#ffb4c8" stroke="#9b7184" stroke-width="2"/>
    <path d="M60 44V70M57 46Q48 25 42 20M64 46Q74 25 79 20" fill="none" stroke="#45655d" stroke-width="4" stroke-linecap="round"/>
    <circle cx="60" cy="46" r="6" fill="#f8dd85"/>
  </svg>
  <span class="friend-spark sparkle-one">✦</span><span class="friend-spark sparkle-two">✻</span><span class="friend-spark sparkle-three">✧</span>
</div>`;
