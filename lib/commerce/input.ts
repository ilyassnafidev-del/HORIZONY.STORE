import { z } from "zod";
import { parsePhoneNumberFromString } from "libphonenumber-js/min";
import countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json" with { type: "json" };
import metadata from "./address-metadata.json" with { type: "json" };
countries.registerLocale(english);

export const defaultShippingCountries = "AL,AD,AM,AT,AZ,BY,BE,BA,BG,HR,CY,CZ,DK,EE,FI,FR,GE,DE,GR,HU,IS,IE,IT,KZ,XK,LV,LI,LT,LU,MT,MD,MC,ME,NL,MK,NO,PL,PT,RO,RU,SM,RS,SK,SI,ES,SE,CH,TR,UA,GB,VA,US,CA,AU".split(",");
export function addressFormat(code: string) {
  const data = (metadata as Record<string, {require:string;fmt:string;state:string;zip:string|null}>)[code];
  return { region: Boolean(data?.fmt.includes("%S")), postal: Boolean(data?.fmt.includes("%Z")),
    city: data ? data.fmt.includes("%C") : true, regionRequired: Boolean(data?.require.includes("S")),
    postalRequired: Boolean(data?.require.includes("Z")), cityRequired: Boolean(data?.require.includes("C")),
    regionLabel: data?.state === "province" ? "Province / region" : data?.state === "emirate" ? "Emirate" : "State / province / region" };
}
export const countryOptions = Object.keys(countries.getAlpha2Codes()).map(code => ({code, name:countries.getName(code,"en") ?? code, ...addressFormat(code)})).sort((a,b)=>a.name.localeCompare(b.name));
const text = (max=200) => z.string().trim().max(max).refine(value=>!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value),"Invalid control characters.");
export const shippingSchema = z.object({firstName:text(80).min(1),lastName:text(80).min(1),email:text(254).refine(value=>!value||z.email().safeParse(value).success,"Enter a valid email address."),
  phone:text(40).refine(value=>value.startsWith("+")&&Boolean(parsePhoneNumberFromString(value)?.isValid()),"Use a valid phone number with international + country code."),
  country:text(2).refine(code=>countries.isValid(code),"Choose a valid country."),region:text(100),city:text(100),street:text().min(1),unit:text(),postal:text(32),
}).strict().superRefine((value,context)=>{
  const format=addressFormat(value.country);
  for(const [field,required] of [["region",format.regionRequired],["postal",format.postalRequired],["city",format.cityRequired]] as const){
    if(required&&!value[field])context.addIssue({code:"custom",path:[field],message:"Required for this country."});
  }
}).transform(value=>({...value,phone:parsePhoneNumberFromString(value.phone)!.number}));
export type Shipping = z.output<typeof shippingSchema>;
export const checkoutSchema=z.object({requestId:z.uuid(),shipping:shippingSchema,items:z.array(z.object({productId:z.string().max(60),size:z.string().max(20),quantity:z.number().int().min(1).max(99)}).strict()).min(1).max(84)}).strict();
export function strongPassword(password:string) { return password.length>=14&&password.length<=256&&/[a-z]/.test(password)&&/[A-Z]/.test(password)&&/[0-9]/.test(password)&&/[^A-Za-z0-9]/.test(password); }
export const fulfillmentSchema=z.object({fulfillment:z.enum(["UNFULFILLED","PROCESSING","SHIPPED","DELIVERED"]).optional(),note:text(2000).min(1).optional()}).strict().refine(value=>value.fulfillment||value.note,"Choose an update.");
