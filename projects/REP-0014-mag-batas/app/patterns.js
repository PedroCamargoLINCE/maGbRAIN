/* Pure, seeded pattern engine. Coordinates and output are resolution independent. */
(function(root){
  'use strict';
  function random(seed){
    let h=2166136261;
    for(const c of String(seed)){h^=c.codePointAt(0);h=Math.imul(h,16777619);}
    return function(){h+=0x6D2B79F5;let t=h;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
  }
  function palette(seed,count){
    const r=random(seed+'|palette'),base=r()*360;
    return Array.from({length:count},(_,i)=>hsl((base+i*360/count+r()*22)%360,65+r()*30,28+i*38/Math.max(1,count-1)));
  }
  function hsl(h,s,l){s/=100;l/=100;const a=s*Math.min(l,1-l);return '#'+[0,8,4].map(n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,'0');}).join('');}
  function render(ctx,w,h,opt){
    const colors=opt.colors,r=random(opt.seed+'|'+opt.style),detail=Number(opt.detail),TAU=Math.PI*2;
    ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=colors[0];ctx.fillRect(0,0,w,h);
    if(opt.style==='geometry'){
      const cols=5+Math.floor(detail/7),size=w/cols,rows=Math.ceil(h/size);
      for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){
        const pick=()=>colors[Math.floor(r()*colors.length)];
        ctx.save();ctx.translate((x+.5)*size,(y+.5)*size);ctx.rotate(Math.floor(r()*4)*Math.PI/2);
        ctx.fillStyle=pick();ctx.fillRect(-size/2,-size/2,size+1,size+1);
        ctx.fillStyle=pick();ctx.beginPath();
        if(r()<.5){ctx.moveTo(-size/2,-size/2);ctx.lineTo(size/2,-size/2);ctx.lineTo(-size/2,size/2);ctx.closePath();}
        else{ctx.moveTo(-size/2,-size/2);ctx.arc(-size/2,-size/2,size,0,Math.PI/2);ctx.closePath();}
        ctx.fill();ctx.restore();
      }
    }else if(opt.style==='fractal'){
      // Escape-time Julia set: seed controls c and orientation; discrete palette bands.
      const angle=r()*TAU,cx=-.78+r()*.18,cy=.12+r()*.13,zoom=1.1+r()*.45,iter=30+Math.floor(detail*.9);
      const rgb=colors.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),img=ctx.createImageData(w,h);
      const co=Math.cos(angle),si=Math.sin(angle);
      for(let py=0;py<h;py++)for(let px=0;px<w;px++){
        let u=(px/w-.5)*3.2/zoom,v=(py/h-.5)*3.2*h/w/zoom;
        let x=u*co-v*si,y=u*si+v*co,n=0;
        while(x*x+y*y<64&&n<iter){const nx=x*x-y*y+cx;y=2*x*y+cy;x=nx;n++;}
        const c=rgb[n===iter?0:1+Math.floor(n/3)%Math.max(1,rgb.length-1)]||rgb[0],i=(py*w+px)*4;
        img.data[i]=c[0];img.data[i+1]=c[1];img.data[i+2]=c[2];img.data[i+3]=255;
      }ctx.putImageData(img,0,0);
    }else{
      // Domain-warped interference field, quantized into the chosen palette.
      const phase=r()*TAU,f=3+detail/9,ax=r()*2-1,ay=r()*2-1;
      const rgb=colors.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),img=ctx.createImageData(w,h);
      for(let py=0;py<h;py++)for(let px=0;px<w;px++){
        const x=(px/w-.5)*2,y=(py/h-.5)*2*h/w;
        const u=x+.32*Math.sin(y*4+phase),v=y+.28*Math.cos(x*5-phase);
        const field=Math.sin(u*f+phase)+Math.cos(v*f*.8)+Math.sin(Math.hypot(u-ax,v-ay)*f*1.8);
        const c=rgb[Math.min(rgb.length-1,Math.floor((field+3)/6*rgb.length))],i=(py*w+px)*4;
        img.data[i]=c[0];img.data[i+1]=c[1];img.data[i+2]=c[2];img.data[i+3]=255;
      }ctx.putImageData(img,0,0);
    }
    ctx.restore();
  }
  const api={random,palette,render};if(typeof module!=='undefined')module.exports=api;else root.MagPatterns=api;
})(typeof window==='undefined'?globalThis:window);
