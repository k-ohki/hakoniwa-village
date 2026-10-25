// ================= drawing: props =================
function growth(){return .45+.55*(((clock.day-1)*24+clock.hour)%72)/72}
function canopy(i,t,sway,cols,blossom){
  snowOn=true;[[0,-1.25,.62],[-.32,-1,.42],[.34,-1.05,.45],[.05,-1.6,.4]].forEach(([x,y,r],k)=>{N.fillStyle=rgbA(k===3?snowy(cols[k]):mix(cols[k],snowy(cols[k]),.6));N.beginPath();N.arc(i[0]+x*t+sway*(-y),i[1]+y*t,r*t,0,2*Math.PI);N.fill()});snowOn=false;
  N.fillStyle=rgbA(blossom,1,.95);for(let k=0;k<6;k++){N.beginPath();N.arc(i[0]+(hash(k+10*t)-.5)*t*1.1+sway,i[1]-t*(.9+.9*hash(3*k+t)),.06*t,0,2*Math.PI);N.fill()}
}
function drawProp(e){
  const l=cam.scale,i=project(e.local);
  if(e.kind==='tree'||e.kind==='sakura'){const t=e.r*l,sway=Math.sin(S.time*1.2+e.id)*t*.03;
    N.fillStyle='rgba(60,50,100,0.18)';N.beginPath();N.ellipse(i[0],i[1],.7*t,.35*t,0,0,2*Math.PI);N.fill();
    N.fillStyle=rgbA([185,138,118]);N.fillRect(i[0]-.08*t,i[1]-.9*t,.16*t,.9*t);
    if(e.kind==='tree')canopy(i,t,sway,[[159,211,160],[140,199,149],[169,220,168],[191,230,178]],[255,190,200]);
    else{canopy(i,t,sway,[[248,190,206],[240,172,194],[252,204,218],[255,222,232]],[255,250,252]);
      N.fillStyle='rgba(255,200,215,0.85)';for(let k=0;k<5;k++){const ph=(S.time*.15+hash(k*4))%1;N.beginPath();N.ellipse(i[0]+(hash(k*7)-.5)*t*2+Math.sin(S.time+k)*t*.2,i[1]-t*1.6+ph*t*1.7,.05*t,.03*t,ph*6,0,2*Math.PI);N.fill()}}
  }else if(e.kind==='lantern'){N.fillStyle=rgbA([143,127,180]);N.fillRect(i[0]-.025*l,i[1]-.62*l,.05*l,.62*l);
    const gA=.2+.7*nightK,g=N.createRadialGradient(i[0],i[1]-.68*l,0,i[0],i[1]-.68*l,(.35+.45*nightK)*l);g.addColorStop(0,`rgba(255,226,150,${gA})`);g.addColorStop(1,'rgba(255,226,150,0)');N.fillStyle=g;N.fillRect(i[0]-l,i[1]-1.7*l,2*l,2*l);
    N.fillStyle=rgb(mix(A([255,227,163]),[255,232,170],nightK));N.fillRect(i[0]-.07*l,i[1]-.78*l,.14*l,.18*l);
  }else if(e.kind==='pole'){if(festK<.01)return;const h=1.7*l*festK;N.strokeStyle=rgbA([180,140,110]);N.lineWidth=Math.max(1.5,.05*l);N.beginPath();N.moveTo(i[0],i[1]);N.lineTo(i[0],i[1]-h);N.stroke();N.fillStyle=rgbA(P.coral);N.beginPath();N.arc(i[0],i[1]-h,.06*l,0,2*Math.PI);N.fill();
  }else if(e.kind==='crop'){const g=growth(),t=l*g,y=i[1]-.05*l,sw=Math.sin(S.time*2+e.id)*.03*t;snowOn=true;
    for(const dx of[-.22,.22]){const x=i[0]+dx*l*.9;
      if(e.type===0){[[0,-.12,.17,[124,190,116]],[-.09,-.08,.12,[150,206,128]],[.09,-.09,.12,[140,200,124]],[0,-.17,.1,[178,224,150]]].forEach(([ox,oy,r,c])=>{N.fillStyle=rgbA(snowy(c));N.beginPath();N.arc(x+ox*t,y+oy*t,r*t,0,2*Math.PI);N.fill()})}
      else{N.fillStyle=rgbA([238,140,74]);N.beginPath();N.ellipse(x,y-.02*t,.06*t,.04*t,0,0,2*Math.PI);N.fill();N.strokeStyle=rgbA([110,180,104]);N.lineWidth=Math.max(1,.04*l);N.beginPath();for(const a of[-.5,0,.5]){N.moveTo(x,y-.04*t);N.lineTo(x+a*.18*t+sw,y-.36*t)}N.stroke()}}snowOn=false;
  }
}

