import {getMiski3Settings} from '@/lib/storefront/miski3-server';
import {SiteChrome as Header} from './SiteChrome';
export async function SiteChrome(){const settings=await getMiski3Settings();return <Header settings={settings}/>}
