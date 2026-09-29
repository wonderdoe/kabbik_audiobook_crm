import { DateValue } from "@mantine/dates";

export type tProps={
    label:string;
    placeholder:string;
    changeHandler:(val:DateValue)=>void;
    value:DateValue;
    error:boolean
}