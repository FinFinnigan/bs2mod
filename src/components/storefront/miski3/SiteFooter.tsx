import Link from 'next/link';
import {getMiski3Settings} from '@/lib/storefront/miski3-server';
export async function SiteFooter(){
  const c=await getMiski3Settings();
  return <footer className="footer"><div className="container"><div className="footer__grid"><div><Link href="/" className="m2-logo">{c.brandName}</Link><p>{c.footer}</p>{c.contact&&<p>{c.contact}</p>}{c.social&&<a href={c.social}>Follow us</a>}</div><div><h3>Explore</h3><ul><li><Link href="/shop">Shop all</Link></li><li><Link href="/collection/new-arrivals">New arrivals</Link></li><li><Link href="/collection/sale">Sale</Link></li></ul></div><div><h3>Here to help</h3><ul><li><Link href="/size-guide">Size guide</Link></li><li><Link href="/pages/shipping-returns">Shipping &amp; returns</Link></li><li><Link href="/pages/contact">Contact</Link></li></ul></div><div><h3>The details</h3><ul><li><Link href="/pages/privacy">Privacy</Link></li><li><Link href="/pages/terms">Terms</Link></li><li><Link href="/account">Your account</Link></li></ul></div></div><p style={{marginTop:40,fontSize:12,color:'var(--color-ink-muted)'}}>© {new Date().getFullYear()} {c.brandName}</p></div></footer>;
}
