'use server';
import {cookies} from 'next/headers';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {getAdminSession} from '../../session';
import {adminGateDecision} from '../../gate';
import {hasDatabase} from '@/lib/backend/db/client';
import {getApp} from '@/lib/backend/container';
import {MISKI3_KEY,miski3Schema} from '@/lib/storefront/miski3-settings';
export async function editMiski3(form:FormData){
 const decision=adminGateDecision((await getAdminSession())?.role);if(decision!=='allow')redirect(decision==='login'?'/admin/login':'/admin/forbidden');
 if(!hasDatabase())redirect('/admin/storefront?error=database');
 const mode=form.get('mode'); const jar=await cookies();
 if(mode==='exit'){jar.delete('storefront-preview');redirect('/');}
 if(mode==='rollback'){const previous=await getApp().settings.get(`${MISKI3_KEY}.previous`);if(miski3Schema.safeParse(previous).success)await getApp().settings.set(`${MISKI3_KEY}.published`,previous);revalidatePath('/','layout');redirect('/admin/storefront');}
 const raw=Object.fromEntries(form.entries());
 const parsed=miski3Schema.safeParse({...raw,sections:['hero','featured','editorial'].map((type,i)=>({id:type,type,enabled:form.get(`${type}Enabled`)==='on',position:Number(form.get(`${type}Position`)??i)}))});
 if(!parsed.success)redirect('/admin/storefront?error=settings');
 await getApp().settings.set(`${MISKI3_KEY}.draft`,parsed.data);
 if(mode==='publish'){
 const previous=await getApp().settings.get(`${MISKI3_KEY}.published`);if(previous)await getApp().settings.set(`${MISKI3_KEY}.previous`,previous);
 await getApp().settings.set(`${MISKI3_KEY}.published`,parsed.data);await getApp().settings.set('storefront.template','miski3');jar.delete('storefront-preview');
 }
 revalidatePath('/','layout');
 if(mode==='preview'){jar.set('storefront-preview','miski3',{httpOnly:true,sameSite:'lax',secure:process.env.NODE_ENV==='production',path:'/',maxAge:3600});redirect('/');}
 redirect('/admin/storefront?saved=1');
}