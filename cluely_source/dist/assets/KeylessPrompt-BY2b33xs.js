!function(){try{var e="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]="019de4e7-1e29-7130-a957-af3fb80ff33b")}catch(e){}}();import{o as e}from"./chunk-CFjPhJqf.js";import{L as t,m as n}from"./react-BVAPS1vU.js";import{t as r}from"./react-Ca0nn9kB.js";import{n as i,r as a,t as o}from"./emotion-react-jsx-runtime.browser.esm-mc3jWDhr.js";import{n as s}from"./EnvironmentContext-CjGVLxkT.js";import{t as c}from"./InternalThemeProvider-CkDwt2Zg.js";import{t as l}from"./emotion-react.browser.esm-DVOQ-jfI.js";import{a as u}from"./shared-DgpfQKNF.js";var d=e(r(),1),f=`clerk-keyless-prompt-corner`,p=`1.25rem`,m=20,h=5,g=10,_=5,v=.999,y=`transform 350ms cubic-bezier(0.34, 1.2, 0.64, 1)`,b=`translate3d(0px, 0px, 0)`,x={x:0,y:0};function S(e,t){let n=`bottom-right`,r=1/0;for(let[i,a]of Object.entries(t)){let t=e.x-a.x,o=e.y-a.y,s=Math.sqrt(t*t+o*o);s<r&&(r=s,n=i)}return n}function C(e){switch(e){case`top-left`:return{top:p,left:p};case`top-right`:return{top:p,right:p};case`bottom-left`:return{bottom:p,left:p};case`bottom-right`:return{bottom:p,right:p}}}var w=[`top-left`,`top-right`,`bottom-left`,`bottom-right`];function T(e){if(!(typeof window>`u`))try{localStorage.setItem(f,e)}catch{}}function E(e){return e/1e3*v/(1-v)}function D(e){if(e.length<2)return x;let t=e[0],n=e[e.length-1],r=n.timestamp-t.timestamp;return r===0?x:{x:(n.position.x-t.position.x)/r*1e3,y:(n.position.y-t.position.y)/r*1e3}}function O(){let[e,t]=(0,d.useState)(`bottom-right`),[n,r]=(0,d.useState)(!1),[i,a]=(0,d.useState)(!1),[o,s]=(0,d.useState)(!1),c=(0,d.useRef)(null);(0,d.useEffect)(()=>{if(typeof window>`u`){s(!0);return}try{let e=localStorage.getItem(f);e&&w.includes(e)&&t(e)}catch{}finally{s(!0)}},[]);let l=(0,d.useRef)(null),u=(0,d.useRef)({state:`idle`}),p=(0,d.useRef)(null),v=(0,d.useRef)({x:0,y:0}),O=(0,d.useRef)({x:0,y:0}),k=(0,d.useRef)(0),A=(0,d.useRef)([]),j=(0,d.useRef)(null),M=(0,d.useCallback)(e=>{l.current&&(O.current=e,l.current.style.transform=`translate3d(${e.x}px, ${e.y}px, 0)`)},[]),N=(0,d.useCallback)(()=>{let t=l.current;if(!t)return{"top-left":x,"top-right":x,"bottom-left":x,"bottom-right":x};let n=j.current?.width??t.offsetWidth??0,r=j.current?.height??t.offsetHeight??0,i=window.innerWidth-document.documentElement.clientWidth;function a(e){let t=e.includes(`right`),a=e.includes(`bottom`);return{x:t?window.innerWidth-i-m-n:m,y:a?window.innerHeight-m-r:m}}let o=a(e);function s(e){let t=a(e);return{x:t.x-o.x,y:t.y-o.y}}return{"top-left":s(`top-left`),"top-right":s(`top-right`),"bottom-left":s(`bottom-left`),"bottom-right":s(`bottom-right`)}},[e]),P=(0,d.useCallback)(n=>{let r=l.current;if(!r)return;let i=n.translation.x-O.current.x,o=n.translation.y-O.current.y;if(Math.sqrt(i*i+o*o)<.5){T(n.corner),O.current=x,r.style.transition=``,r.style.transform=b,u.current={state:`idle`},a(!1);return}let s=i=>{i.propertyName===`transform`&&(r.removeEventListener(`transitionend`,s),T(n.corner),n.corner===e?(O.current=x,r.style.transition=``,r.style.transform=b,u.current={state:`idle`},a(!1)):(u.current={state:`animating`},c.current=n.corner,t(n.corner)))};r.style.transition=y,r.addEventListener(`transitionend`,s),M(n.translation)},[M,e]),F=(0,d.useCallback)(()=>{u.current.state===`drag`?(l.current?.releasePointerCapture(u.current.pointerId),u.current={state:`animating`}):u.current={state:`idle`},p.current&&=(p.current(),null),A.current=[],r(!1),j.current=null,l.current?.classList.remove(`dev-tools-grabbing`),document.body.style.removeProperty(`user-select`),document.body.style.removeProperty(`-webkit-user-select`)},[]);(0,d.useLayoutEffect)(()=>{if(c.current===e){let e=l.current;e&&u.current.state===`animating`&&(O.current=x,e.style.transition=``,e.style.transform=b,u.current={state:`idle`},a(!1),c.current=null)}},[e]),(0,d.useLayoutEffect)(()=>()=>{F()},[F]);let I=(0,d.useCallback)(e=>{let t=e.target;if(t.tagName===`A`||t.closest(`a`)||e.button!==0)return;let n=l.current;if(!n)return;j.current={width:n.offsetWidth,height:n.offsetHeight},v.current={x:e.clientX,y:e.clientY};let i=n.style.transform;if(i&&i!==`none`&&i!==b){let e=i.match(/translate3d\(([^,]+)px,\s*([^,]+)px/);e&&(O.current={x:parseFloat(e[1])||0,y:parseFloat(e[2])||0})}else O.current=x;u.current={state:`press`},A.current=[],k.current=Date.now();let o=e=>{if(u.current.state===`press`){let t=e.clientX-v.current.x,i=e.clientY-v.current.y;if(Math.sqrt(t*t+i*i)<h)return;u.current={state:`drag`,pointerId:e.pointerId};try{n.setPointerCapture(e.pointerId)}catch{}n.style.transition=`none`,n.classList.add(`dev-tools-grabbing`),document.body.style.userSelect=`none`,document.body.style.webkitUserSelect=`none`,r(!0),M({x:O.current.x+t,y:O.current.y+i}),v.current={x:e.clientX,y:e.clientY};return}if(u.current.state!==`drag`)return;let t={x:e.clientX,y:e.clientY},i=t.x-v.current.x,a=t.y-v.current.y;v.current=t,M({x:O.current.x+i,y:O.current.y+a});let o=Date.now();o-k.current>=g&&(A.current=[...A.current.slice(-_+1),{position:t,timestamp:o}],k.current=o)},s=()=>{if(u.current.state===`drag`){let e=D(A.current),t=N();if(F(),!l.current)return;let n=S({x:O.current.x+E(e.x),y:O.current.y+E(e.y)},t),r=t[n];a(!0),P({corner:n,translation:r})}else F()},c=e=>{let t=e.target,n=t.tagName===`BUTTON`||t.closest(`button`),r=t.tagName===`A`||t.closest(`a`);u.current.state===`animating`&&!n&&!r&&(e.preventDefault(),e.stopPropagation())};window.addEventListener(`pointermove`,o),window.addEventListener(`pointerup`,s,{once:!0}),window.addEventListener(`pointercancel`,F,{once:!0}),n.addEventListener(`click`,c),p.current&&p.current(),p.current=()=>{window.removeEventListener(`pointermove`,o),window.removeEventListener(`pointerup`,s),window.removeEventListener(`pointercancel`,F),n.removeEventListener(`click`,c)}},[F,M,P,N]);return{corner:e,isDragging:n,cornerStyle:C(e),containerRef:l,onPointerDown:I,preventClick:i,isInitialized:o}}var k=10*1e3;function A(){let e=n(),t=(0,d.useRef)(Date.now()),[,r]=(0,d.useReducer)(e=>e+1,0);return(0,d.useEffect)(()=>{let n=new AbortController;return window.addEventListener(`focus`,async()=>{let i=e.__internal_environment;if(i){if(i.authConfig.claimedAt!==null)return n.abort();if(!(Date.now()<t.current+k||document.visibilityState!==`visible`))for(let e=0;e<2;e++){let{authConfig:{claimedAt:e}}=await i.fetch();if(t.current=Date.now(),e!==null){r();break}}}},{signal:n.signal}),()=>{n.abort()}},[]),s()}function j(e){try{return e()}catch{return`https://dashboard.clerk.com/last-active`}}var M=`18rem`,N=`220ms`,P=`180ms`,F=`cubic-bezier(0.2, 0, 0, 1)`,I=l`
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background: none;
  border: none;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    avenir next,
    avenir,
    segoe ui,
    helvetica neue,
    helvetica,
    Cantarell,
    Ubuntu,
    roboto,
    noto,
    arial,
    sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  text-decoration: none;
  color: inherit;
  appearance: none;
`;function L(e){return e?N:P}var R=l`
  ${I};
  margin: 0.75rem 0 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 1.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.12px;
  color: #fde047;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.32);
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 30.5%, rgba(0, 0, 0, 0.05) 100%), #454545;
  box-shadow:
    0px 0px 0px 1px rgba(255, 255, 255, 0.04) inset,
    0px 1px 0px 0px rgba(255, 255, 255, 0.04) inset,
    0px 0px 0px 1px rgba(0, 0, 0, 0.12),
    0px 1.5px 2px 0px rgba(0, 0, 0, 0.48),
    0px 0px 4px 0px rgba(243, 107, 22, 0) inset;
  outline: none;
  &:hover {
    background: #4b4b4b;
    transition: background-color 120ms ease-in-out;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
  &:focus-visible {
    outline: 2px solid #6c47ff;
    outline-offset: 2px;
  }
`,z={idle:{triggerWidth:`14.25rem`,title:`Configure your application`,description:a(o,{children:[i(`p`,{children:`Temporary API keys are enabled so you can get started immediately.`}),i(`ul`,{children:[`Add SSO connections (eg. GitHub)`,`Set up B2B authentication`,`Enable MFA`].map(e=>i(`li`,{children:e},e))}),i(`p`,{children:`Access the dashboard to customize auth settings and explore Clerk features.`})]}),cta:{kind:`link`,text:`Configure your application`,href:({claimUrl:e})=>e}},userCreated:{triggerWidth:`15.75rem`,title:`You've created your first user!`,description:i(`p`,{children:`Head to the dashboard to customize authentication settings, view user info, and explore more features.`}),cta:{kind:`link`,text:`Configure your application`,href:({claimUrl:e})=>e}},claimed:{triggerWidth:`14.25rem`,title:`Missing environment keys`,description:i(`p`,{children:`You claimed this application but haven't set keys in your environment. Get them from the Clerk Dashboard.`}),cta:{kind:`link`,text:`Get API keys`,href:({claimUrl:e})=>e}},completed:{triggerWidth:`10.5rem`,title:`Your app is ready`,description:({appName:e,instanceUrl:t})=>a(`p`,{children:[`Your application`,` `,i(`a`,{href:t,target:`_blank`,rel:`noopener noreferrer`,children:e}),` `,`has been configured. You may now customize your settings in the Clerk dashboard.`]}),cta:{kind:`action`,text:`Dismiss`,onClick:e=>{e?.().then(()=>{window.location.reload()})}}}};function B(e,t,n){return t?`completed`:e?`claimed`:n?`userCreated`:`idle`}function V(e,t){let n=z[e],r=typeof n.description==`function`?n.description({appName:t.appName,instanceUrl:t.instanceUrl}):n.description,i=n.cta,a=i.kind===`link`?{kind:`link`,text:i.text,href:typeof i.href==`function`?i.href({claimUrl:t.claimUrl,instanceUrl:t.instanceUrl}):i.href}:{kind:`action`,text:i.text,onClick:()=>i.onClick(t.onDismiss)};return{state:e,triggerWidth:n.triggerWidth,title:n.title,description:r,cta:a}}function H(e){let n=(0,d.useId)(),r=A(),{isDragging:o,cornerStyle:s,containerRef:c,onPointerDown:f,preventClick:p,isInitialized:m}=O(),h=!!r.authConfig.claimedAt,g=typeof e.onDismiss==`function`&&h,{isSignedIn:_}=t(),v=r.displayConfig.applicationName,y=(0,d.useMemo)(()=>{if(h)return e.copyKeysUrl;let t=new URL(e.claimUrl);return t.searchParams.append(`return_url`,window.location.href),t.href},[h,e.copyKeysUrl,e.claimUrl]),b=(0,d.useMemo)(()=>j(()=>{let t=u(e.copyKeysUrl);return new URL(`${t.baseDomain}/apps/${t.appId}/instances/${t.instanceId}/user-authentication/email-phone-username`).href}),[e.copyKeysUrl]),[x,S]=(0,d.useState)(!0),C=B(h,g,!!_),w=(0,d.useMemo)(()=>V(C,{appName:v,instanceUrl:b,claimUrl:y,onDismiss:e.onDismiss}),[C,v,b,y,e.onDismiss]),T=w.cta.kind===`link`?i(`a`,{href:w.cta.href,target:`_blank`,rel:`noopener noreferrer`,css:R,children:w.cta.text}):i(`button`,{type:`button`,onClick:w.cta.onClick,css:R,children:w.cta.text});return a(`div`,{ref:c,onPointerDown:x?void 0:f,style:{...s,opacity:m?void 0:0},"data-expanded":x,css:l`
        ${I};
        position: fixed;
        border-radius: ${x?`0.75rem`:`2.5rem`};
        background-color: #1f1f1f;
        box-shadow:
          0px 0px 0px 0.5px #2f3037 inset,
          0px 1px 0px 0px rgba(255, 255, 255, 0.08) inset,
          0px 0px 0.8px 0.8px rgba(255, 255, 255, 0.2) inset,
          0px 0px 0px 0px rgba(255, 255, 255, 0.72),
          0px 16px 36px -6px rgba(0, 0, 0, 0.36),
          0px 6px 16px -2px rgba(0, 0, 0, 0.2);
        height: auto;
        isolation: isolate;
        transform: translateZ(0);
        backface-visibility: hidden;
        width: ${x?M:w.triggerWidth};
        cursor: ${o?`grabbing`:x?`default`:`grab`};
        touch-action: none;
        transition: ${o?`none`:m?`width ${L(x)} ${F}, border-radius ${L(x)} cubic-bezier(0.2, 0, 0, 1)`:`none`};

        @media (prefers-reduced-motion: reduce) {
          transition: none;
        }
        &:has(button:focus-visible) {
          outline: 2px solid #6c47ff;
          outline-offset: 2px;
        }
        &::before {
          content: '';
          pointer-events: none;
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background-image: linear-gradient(180deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 100%);
          opacity: 0.16;
          transition: opacity ${L(x)} ${F};

          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
        }
        &[data-expanded='true']::before,
        &:hover::before {
          opacity: 0.2;
        }
      `,children:[a(`button`,{type:`button`,"aria-label":`Keyless prompt`,"aria-controls":n,"aria-expanded":x,onClick:()=>{p||S(e=>!e)},css:l`
          ${I};
          display: flex;
          align-items: center;
          width: 100%;
          border-radius: inherit;
          padding-inline: 0.75rem;
          gap: 0.25rem;
          height: 2.5rem;
          outline: none;
          cursor: pointer;
          user-select: none;
        `,children:[a(`svg`,{css:l`
            width: 1rem;
            height: 1rem;
            flex-shrink: 0;
          `,fill:`none`,viewBox:`0 0 128 128`,children:[i(`circle`,{cx:`64`,cy:`64`,r:`20`,fill:`#fff`}),i(`path`,{fill:`#fff`,fillOpacity:`.4`,d:`M99.572 10.788c1.999 1.34 2.17 4.156.468 5.858L85.424 31.262c-1.32 1.32-3.37 1.53-5.033.678A35.846 35.846 0 0 0 64 28c-19.882 0-36 16.118-36 36a35.846 35.846 0 0 0 3.94 16.391c.851 1.663.643 3.712-.678 5.033L16.646 100.04c-1.702 1.702-4.519 1.531-5.858-.468C3.974 89.399 0 77.163 0 64 0 28.654 28.654 0 64 0c13.163 0 25.399 3.974 35.572 10.788Z`}),i(`path`,{fill:`#fff`,d:`M100.04 111.354c1.702 1.702 1.531 4.519-.468 5.858C89.399 124.026 77.164 128 64 128c-13.164 0-25.399-3.974-35.572-10.788-2-1.339-2.17-4.156-.468-5.858l14.615-14.616c1.322-1.32 3.37-1.53 5.033-.678A35.847 35.847 0 0 0 64 100a35.846 35.846 0 0 0 16.392-3.94c1.662-.852 3.712-.643 5.032.678l14.616 14.616Z`})]}),i(`span`,{css:l`
            ${I};
            font-size: 0.875rem;
            font-weight: 500;
            color: #d9d9d9;
            white-space: nowrap;
          `,children:w.title}),i(`svg`,{css:l`
            width: 1rem;
            height: 1rem;
            flex-shrink: 0;
            color: #d9d9d9;
            margin-inline-start: auto;
            opacity: ${x?.5:0};
            transition: opacity ${L(x)} ease-out;

            @media (prefers-reduced-motion: reduce) {
              transition: none;
            }
            ${x&&l`
              button:hover & {
                opacity: 1;
              }
            `}
          `,viewBox:`0 0 16 16`,fill:`none`,"aria-hidden":`true`,xmlns:`http://www.w3.org/2000/svg`,children:i(`path`,{d:`M3.75 8H12.25`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`})})]}),i(`div`,{id:n,...!x&&{inert:``},css:l`
          ${I};
          display: grid;
          grid-template-rows: ${x?`1fr`:`0fr`};
          transition: grid-template-rows ${L(x)} ${F};

          @media (prefers-reduced-motion: reduce) {
            transition: none;
          }
        `,children:i(`div`,{css:l`
            ${I};
            min-height: 0;
            overflow: hidden;
          `,children:a(`div`,{css:l`
              ${I};
              width: ${M};
              padding-inline: 0.75rem;
              padding-block-end: 0.75rem;
              opacity: ${x?1:0};
              transition: opacity ${L(x)} ${F};

              @media (prefers-reduced-motion: reduce) {
                transition: none;
              }
            `,children:[i(`div`,{css:l`
                ${I};
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
                & ul {
                  ${I};
                  list-style: disc;
                  padding-left: 1rem;
                }
                & p,
                & li {
                  ${I};
                  color: #b4b4b4;
                  font-size: 0.8125rem;
                  font-weight: 400;
                  line-height: 1rem;
                  text-wrap: pretty;
                }
                & a {
                  color: #fde047;
                  font-weight: 500;
                  outline: none;
                  text-decoration: underline;
                  &:focus-visible {
                    outline: 2px solid #6c47ff;
                    outline-offset: 2px;
                  }
                }
              `,children:w.description}),T]})})})]})}function U(e){return i(c,{children:i(H,{...e})})}export{U as KeylessPrompt,B as getCurrentState,V as getResolvedContent};
//# chunkId=019de4e7-1e29-7130-a957-af3fb80ff33b