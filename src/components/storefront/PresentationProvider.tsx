'use client';
import {createContext,useContext,type ReactNode,type ImgHTMLAttributes} from 'react';
import type {StorefrontTemplate} from '@/lib/storefront/registry';
const Context=createContext<StorefrontTemplate>('miski');
export function PresentationProvider({template,children}:{template:StorefrontTemplate;children:ReactNode}){return <Context.Provider value={template}>{children}</Context.Provider>}
export function StoreImage(props:ImgHTMLAttributes<HTMLImageElement>){
 const template=useContext(Context);
 // Demo-only art direction. Uploaded catalog photography always passes through untouched.
 if(template==='miski3'&&typeof props.src==='string'&&props.src.startsWith('data:image/svg+xml')){
 const label=(props.alt||'').toLowerCase();
 const index=label.includes('hood')?0:label.includes('set')||label.includes('kit')?2:label.includes('jogger')||label.includes('pant')?3:label.includes('short')?4:label.includes('jacket')||label.includes('puffer')||label.includes('vest')?5:label.includes('sweat')?6:label.includes('polo')?7:1;
 return <span role={props.alt?'img':undefined} aria-label={props.alt||undefined} aria-hidden={!props.alt||undefined} className="m2-demo-photo" style={{display:'block',width:'100%',height:'100%',aspectRatio:'3 / 4',...props.style,backgroundImage:'url(/templates/miski3/catalog.png)',backgroundSize:'400% 200%',backgroundPosition:`${index%4*100/3}% ${index<4?0:100}%`}}/>;
 }
 // eslint-disable-next-line @next/next/no-img-element
 return <img {...props}/>;
}
