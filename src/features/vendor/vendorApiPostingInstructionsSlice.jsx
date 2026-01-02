import { createSlice } from "@reduxjs/toolkit";

const initialState = [
    {
        id: 2824,
        name: "NovaOptimal ACV Partials",
        apiUrl: `http://api.maropost.com/accounts/2112/lists/92/contacts.json?{
      "auth_token":"8F8z-UkLSkRTT8fgnpbVlA8KIb5_AuPTS5YWRn_iiIfQh2tgmQJIKg",
      "email":"%%email%%",
      "first_name":"%%fname%%",
      "last_name":"%%lname%%",
      "subscribed_at":"%%date_subscribed%%",
      "contact.ip":"%%ip%%"
    }`,
    },
    {
        id: 2825,
        name: "NovaOptimal ACV Buyers",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2825&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2826,
        name: "NovaOptimal ACV Declines",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2826&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2827,
        name: "NovaOptimal ACV Partials LIVE",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2827&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2860,
        name: "Levielle Partials",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2860&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2861,
        name: "Levielle Buyers",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2861&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2862,
        name: "Virex Valor Partials",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2862&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2863,
        name: "Virex Valor Buyers",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2863&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2864,
        name: "Virex Valor Declines",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2864&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2865,
        name: "Levielle Partials LIVE",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2865&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
    {
        id: 2890,
        name: "Erekvalor ME Gummy Partials",
        apiUrl: "https://mbc.listflex.com/lmadmin/api/leadimport.php?apikey=9VMS0ZUQZ5D2UDJ9NPl&list_id=2890&fname=John&lname=Doe&email=testemail@emaildomain.com&phone=789-345-2334&alt_phone=111-111-1111&address=123 W Jeff st. 234&city=Phoenix&state=AZ&zip=85111&country=US&date_subscribed=2014-01-12 12:33:00&date_of_birth=1950-01-19&gender=M&offer=offerurlgoeshere.com&ip=12.12.12.12&comments=",
    },
];


const vendorApiPostingInstructionsSlice = createSlice({
    name: "vendorApiPostingInstructions",
    initialState,
    reducers: {
        // You can add actions like addInstruction, removeInstruction, etc.
    },
});

export default vendorApiPostingInstructionsSlice.reducer;
export const { } = vendorApiPostingInstructionsSlice.actions;