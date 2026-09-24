import {describe,it,expect} from 'vitest';
import {MISKI3_DEFAULTS,miski3Schema} from '../miski3-settings';
describe('Miski3 merchant configuration',()=>{
  it('validates template defaults',()=>expect(miski3Schema.safeParse(MISKI3_DEFAULTS).success).toBe(true));
  it('rejects executable links',()=>expect(miski3Schema.safeParse({...MISKI3_DEFAULTS,heroLink:'javascript:alert(1)'}).success).toBe(false));
  it('rejects protocol-relative links',()=>expect(miski3Schema.safeParse({...MISKI3_DEFAULTS,logo:'//example.com/logo'}).success).toBe(false));
  it('rejects CSS injection',()=>expect(miski3Schema.safeParse({...MISKI3_DEFAULTS,primary:'red;display:none'}).success).toBe(false));
  it('supports hiding and reordering predefined sections',()=>expect(miski3Schema.parse({...MISKI3_DEFAULTS,sections:[{id:'featured',type:'featured',enabled:false,position:0}]}).sections[0].enabled).toBe(false));
});
