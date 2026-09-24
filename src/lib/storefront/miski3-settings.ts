import {z} from 'zod';
const link=z.string().max(1000).refine(v=>v.startsWith('/')&&!v.startsWith('//')||/^https:\/\//.test(v),'Use a local path or HTTPS URL');
export const miski3Schema=z.object({
 brandName:z.string().min(1).max(60), logo:z.union([z.literal(''),link]), primary:z.string().regex(/^#[0-9a-fA-F]{6}$/), font:z.enum(['sans','serif']),
 headline:z.string().min(1).max(120), description:z.string().max(300), heroImage:link, heroLink:link, announcement:z.string().max(180),
 featuredTitle:z.string().max(100), collection:z.string().max(80), editorialTitle:z.string().max(100), editorialBody:z.string().max(400),
 contact:z.string().max(150), social:z.union([z.literal(''),link]), footer:z.string().max(300),
 sections:z.array(z.object({id:z.string(),type:z.enum(['hero','featured','editorial']),enabled:z.boolean(),position:z.number().int().min(0).max(20)})).max(3)
});
export type Miski3Settings=z.infer<typeof miski3Schema>;
export const MISKI3_DEFAULTS:Miski3Settings={brandName:'BoyShop',logo:'',primary:'#222326',font:'sans',headline:'Little\nFits.\nBig Stories.',description:'Stylish, comfortable and made for every adventure.',heroImage:'/templates/miski3/hero.png',heroLink:'/shop',announcement:'',featuredTitle:'New season. New stories.',collection:'new-arrivals',editorialTitle:'Small moments.\nBig memories.',editorialBody:'Easy layers for the playground, the weekend and everything in between.',contact:'',social:'',footer:'Kids Wear · Bigger Tomorrow',sections:[{id:'hero',type:'hero',enabled:true,position:0},{id:'featured',type:'featured',enabled:true,position:1},{id:'editorial',type:'editorial',enabled:true,position:2}]};
export const MISKI3_KEY='storefront.miski3';
