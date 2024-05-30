const [rpID, rpName, expectedOrigin] = Deno.env.get('RP')?.split('~') || []
if (!rpID || !rpName || !expectedOrigin) throw new Error('missing relying party keys')

export { expectedOrigin, rpID, rpName }
