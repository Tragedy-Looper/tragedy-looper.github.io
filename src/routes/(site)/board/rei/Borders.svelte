<script lang="ts">
  import { base } from '$app/paths';
  import { nonpassive } from 'svelte/legacy';
  import { getString } from '../../+layout.svelte';
    import Translation from '../../../../view/translation.svelte';
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  version="1.1"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 979.2 690"
>
  <defs>
    <style>
      @font-face {
        font-family: 'Alumni Sans Pinstripe';
        font-style: italic;
        font-weight: 400;
        font-display: swap;
        src: url(/fonts/Alumni_Sans_Pinstripe/AlumniSansPinstripe-Italic.ttf) format('ttf');
      }
      @font-face {
        font-family: 'Alumni Sans Pinstripe';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(/fonts/Alumni_Sans_Pinstripe/AlumniSansPinstripe-Regular.ttf) format('ttf');
      }
      @font-face {
        font-family: 'Darker Grotesque';
        font-style: normal;
        font-weight: 300 900;
        font-display: swap;
        src: url('/fonts/Darker_Grotesque/DarkerGrotesque-VariableFont_wght.ttf');
      }
      @font-face {
        font-family: 'Poiret One';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url(/fonts/Poiret_One/PoiretOne-Regular.ttf) format('ttf');
      }

      .lines {
        fill: none;
        stroke-miterlimit: 100;
        stroke-width: 1px;
      }
      .icons {
        stroke-width: 0px;
      }
      text {
        fill: var(--color);
        font-family: 'Darker Grotesque', sans-serif;
        font-weight: 300;
        font-style: normal;
        stroke: none;
      }
    </style>
  </defs>
  <g class="icons">
    <g id="shrine-icon-inverse" transform="translate(540.9 330.6) scale(.29) ">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        width="137"
        height="136"
        viewBox="0 0 38.7 38.7"
      >
        <path d="M15.5,10.7h4.5v-.8h5v-4.4h-5v-1.5h-4.5v1.5h-5v4.4h5v.8ZM16.4,4.9h2.6v5h-2.6v-5Z" />
        <path
          d="M0,0v38.7h38.7V0H0ZM31.5,2.6l-.2,2.9h-4.5v4.4h3.2v1.2h-3.2v15h-1.9v-15h-14.6v15h-1.9v-15h-3.2v-1.2h3.2v-4.4h-4.4l-.2-2.9c9.2.6,18.4.6,27.7,0ZM7.7,32.5H1.9l.9-5.5h12.2v-7.4h.6c-.4-.2-.7-.6-.7-1.1s.5-1.2,1.2-1.2,1.2.5,1.2,1.2-.3.9-.7,1.1h.5v7.4h11.9v2.6H7.7v2.9ZM8.2,30h22.2v1.8H8.2v-1.8ZM10.1,32.2h22.2v1.8H10.1v-1.8ZM34.2,36.9H12v-2.5h22.2v2.5Z"
        />
      </svg>
    </g>
    <g id="city-icon-inverse" transform="translate(494.2 378.1) scale(.29)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 38.6 38.7"
        width="137"
        height="136"
        class="icons"
      >
        <rect x="29.9" y="20.8" width="1.8" height="3.5" />
        <rect x="29.9" y="31.7" width="1.8" height="3.5" />
        <rect x="32.4" y="26.3" width="1.8" height="3.5" />
        <rect x="32.4" y="15.3" width="1.8" height="3.5" />
        <path d="M20.1,28.1c0-.5-.5-1-1-1s-1,.5-1,1,.4,1,1,1,1-.5,1-1Z" />
        <rect x="24.3" y="20.8" width="1.8" height="3.5" />
        <rect x="26.8" y="15.3" width="1.8" height="3.5" />
        <path
          d="M0,0v38.7h38.7V0H0ZM31.8,2.9c1.4,0,2.7.7,3.4,1.8-.6-.6-.4-.9-2.2-.9s-3.2,1.4-3.2,3.2,1.5,3.2,3.2,3.2,1.6-.4,2.2-.9c-.7,1.1-1.1,1.8-3.4,1.8s-4.1-1.8-4.1-4.1,1.8-4.1,4.1-4.1ZM13.4,36.8H1.9v-8h8.8v-.7H1.9v-2.2h8.8v-.8H1.9v-2.1h8.8v-.8H1.9v-2.1h8.8v-.8H1.9v-2.1h8.8v-.8H1.9v-3.8h11.5v24.2ZM22,35.8h-2.1v-6.7h-1.6v6.7h-3.7V11.4h-2.4v-3.3h2.2v-.4h-2.2v-.6h11.2v-.8h-11.2v-1.7h4.6v-.5h-4.6v-1.7h13v9.4h-3.2v24ZM35.4,36.7h-12.3V12.9h12.3v23.8Z"
        />
        <rect x="24.3" y="31.7" width="1.8" height="3.5" />
        <rect x="26.8" y="26.3" width="1.8" height="3.5" />
      </svg>
    </g>
    <g id="hospital-icon" transform="translate(496.5 332.6) scale(.3)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 38.7 38.7"
        width="121"
        height="122"
        class="icons"
      >
        <path
          d="M24.1,4v10.5h10.5v9.5h-10.5v10.5h-9.5v-10.5H4v-9.5h10.5V4h9.5M26.1,2h-13.5v10.5H2v13.5h10.5v10.5h13.5v-10.5h10.5v-13.5h-10.5V2h0Z"
        />
        <polygon points="22.6 9.1 22.6 6.9 22.6 5.5 16 5.5 16 15.7 22.6 9.1" />
        <polygon points="15.7 15.9 5.6 15.9 5.6 22.6 9.1 22.6 15.7 15.9" />
        <rect x="24" y="15.9" width="9" height="6.6" />
        <polygon
          points="13.9 22.6 16 22.6 16 32.9 18.7 32.9 18.7 25.5 21.1 25.5 21.1 32.9 22.6 32.9 22.6 27.1 22.6 22.6 22.6 15.9 22.6 13.9 13.9 22.6"
        />
      </svg>
    </g>
    <g id="school-icon" transform="translate(543.5 380.7) scale(.3)">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="0 0 38.7 38.7"
        width="119"
        height="118"
      >
        <polygon points="33.7 17.7 33.7 33.2 36.3 33.2 36.3 15 33.7 17.7" />
        <polygon points="26.9 7 17.1 7 17.1 9.6 24.3 9.6 26.9 7" />
        <polygon points="27.6 14.5 27.6 7.6 24.9 10.3 24.9 17.1 32.9 17.1 35.5 14.5 27.6 14.5" />
        <path
          d="M23.6,18.1v-7.5h-10.5v7.5H2.7v18.7h5.3v-4.5h-2.2v-3.4h2.4v1.3c.1,0,.2,0,.4,0,.5,0,.9.4.9.9s-.2.7-.5.8h.2v4.9h1.3v-5.7h.2c-.3-.2-.5-.5-.5-.8,0-.5.4-.9.9-.9s.9.4.9.9-.2.7-.5.8h.2v5.7h1.8v-3.9h.2c-.3-.2-.5-.5-.5-.8,0-.5.4-.9.9-.9s.9.4.9.9-.2.7-.5.8h.2v3.9h1.8v-5.7h.2c-.3-.2-.5-.5-.5-.8,0-.5.4-.9.9-.9s.9.4.9.9-.2.7-.5.8h.2v5.7h14.8v-18.7h-8.7ZM7.7,24.6h-2.4v-3.4h2.4v3.4ZM13.5,25.6h-2.4v-3.4h2.4v3.4ZM17.9,20.4c-2,0-3.6-1.6-3.6-3.6s1.4-3.3,3.1-3.5v3.5l1.9,1.8.6-.6-1.6-1.6v-3.1c1.8.2,3.1,1.7,3.1,3.5s-1.6,3.6-3.6,3.6ZM22.9,31.2h-2.4v-3.4h2.4v3.4ZM26.4,24.3h-2.4v-3.4h2.4v3.4ZM30.5,30.2h-2.4v-3.4h2.4v3.4Z"
        />
        <circle cx="6.1" cy="6.5" r="3.1" />
        <polygon
          points="10.4 14.8 10.4 10.5 9.2 10.5 9.2 14.8 6.7 14.8 6.7 16.7 12.5 16.7 12.5 14.8 10.4 14.8"
        />
      </svg>
    </g>
    <g>
      <path
        class="lines"
        d="M115.2,370.4h373v-45.8h45.5V78.3H115.2v292ZM488.2,378.1H115.2v291.5h418.5v-246h-45.5v-45.5ZM540.9,78.3v246.2h45.5v45.8h371.5V78.3h-417ZM586.4,423.6h-45.5v246h417v-291.5h-371.5v45.5Z"
      />
    </g>
    <g>
      <g>
        <rect class="lines" x="492.2" y="376.1" width="43.6" height="43.6" />
      </g>
      <g>
        <rect class="lines" x="538.8" y="376.1" width="43.6" height="43.6" />
      </g>
      <g>
        <rect class="lines" x="538.8" y="328.6" width="43.6" height="43.6" />
      </g>
      <g>
        <rect class="lines" x="492.2" y="328.6" width="43.6" height="43.6" />
      </g>
    </g>
  </g>
  <text class="images" x="120" y="365">
    <Translation translationKey={'Hospital'} />
  </text>
  <text class="images" x="120" y="663">
    <Translation translationKey={'City'} />
  </text>
  <text class="images" x="953" y="365" text-anchor="end">
    <Translation translationKey={'Shrine'} />
  </text>
  <text class="images" x="953" y="663" text-anchor="end">
    <Translation translationKey={'School'} />
  </text>
</svg>

<style>
  svg {
    --color: #edf1f5;
    stroke: var(--color);
    fill: var(--color);
    mix-blend-mode: color-dodge;
    opacity: 0.6;

    font-family: 'Darker Grotesque', sans-serif;
    font-weight: 300;
    font-style: normal;
  }
</style>
