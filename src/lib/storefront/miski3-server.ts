import {cookies} from 'next/headers';
import {hasDatabase} from '@/lib/backend/db/client';
import {getApp} from '@/lib/backend/container';
import {getAdminSession} from '@/app/admin/session';
import {adminGateDecision} from '@/app/admin/gate';
import {MISKI3_DEFAULTS,MISKI3_KEY,miski3Schema} from './miski3-settings';
export async function getMiski3Settings(draft=false){
 if(!hasDatabase())return MISKI3_DEFAULTS;
 const preview=(await cookies()).get('storefront-preview')?.value==='miski3';
 const allowed=preview&&adminGateDecision((await getAdminSession())?.role)==='allow';
 const value=await getApp().settings.get(`${MISKI3_KEY}.${draft||allowed?'draft':'published'}`);
 const parsed=miski3Schema.safeParse(value);
 return parsed.success?parsed.data:MISKI3_DEFAULTS;
}
