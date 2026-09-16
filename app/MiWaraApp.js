"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import { Camera, Search, Download, Plus, Trash2, X, AlertTriangle, TrendingUp, Settings, MessageCircle, ChevronRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
const MONTH_NAMES = {ENE:"Enero",FEB:"Febrero",MAR:"Marzo",ABR:"Abril",MAY:"Mayo",JUN:"Junio",JUL:"Julio",AGO:"Agosto",SEP:"Septiembre",OCT:"Octubre",NOV:"Noviembre",DIC:"Diciembre"};
const STORAGE_KEY = "mi-wara-data-v1";

const SEED_MOVEMENTS = [
  {mes:"ENE",fecha:"08/01/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:16528925,costoPct:6.0,ventaPct:8.0,aPagar:991736,perc:0,aCobrar:1322314,bille:61640,ganancia:392218},
  {mes:"ENE",fecha:"",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:12396694,costoPct:6.0,ventaPct:8.0,aPagar:743802,perc:0,aCobrar:991736,bille:46385,ganancia:294319},
  {mes:"ENE",fecha:"",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:6611570,costoPct:6.0,ventaPct:8.0,aPagar:396694,perc:0,aCobrar:528926,bille:0,ganancia:132231},
  {mes:"ENE",fecha:"",proveedor:"MARTIN D",contactoProv:"DIM",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264463,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"ENE",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"D FERREIRO",contactoCli:"D FERREIRO",neto:10080885,costoPct:5.0,ventaPct:8.5,aPagar:806471,perc:3.0,aCobrar:1159302,bille:0,ganancia:352831},
  {mes:"ENE",fecha:"25/01/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:12396694,costoPct:6.0,ventaPct:8.0,aPagar:743802,perc:0,aCobrar:991736,bille:90000,ganancia:337934},
  {mes:"ENE",fecha:"22/01/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:19008264,costoPct:6.0,ventaPct:8.0,aPagar:1140496,perc:0,aCobrar:1520661,bille:140000,ganancia:520165},
  {mes:"ENE",fecha:"23/01/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:12396694,costoPct:6.0,ventaPct:8.0,aPagar:743802,perc:0,aCobrar:991736,bille:30000,ganancia:277934},
  {mes:"ENE",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"LAUTIN",contactoCli:"GUIDO S",neto:178076809,costoPct:5.0,ventaPct:6.0,aPagar:8903840,perc:0,aCobrar:10684609,bille:0,ganancia:1780768},
  {mes:"ENE",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"Famicar",contactoCli:"DAN MIZRAHI",neto:18036238,costoPct:5.0,ventaPct:8.0,aPagar:901812,perc:0,aCobrar:1442899,bille:0,ganancia:541087},
  {mes:"ENE",fecha:"",proveedor:"ELIAHU LEVY",contactoProv:"LEVY NAOMI",cliente:"VARIOS",contactoCli:"GASTON FALLAS",neto:34086638,costoPct:6.5,ventaPct:8.0,aPagar:2215631,perc:0,aCobrar:2726931,bille:0,ganancia:511300},
  {mes:"ENE",fecha:"",proveedor:"IONI S (SIN)",contactoProv:"HOMETEX",cliente:"MAZON",contactoCli:"VIVI SELEM",neto:100000000,costoPct:6.0,ventaPct:6.0,aPagar:6000000,perc:0,aCobrar:6000000,bille:0,ganancia:0},
  {mes:"ENE",fecha:"",proveedor:"VIVI SELEM",contactoProv:"MAZON",cliente:"WEBCOM",contactoCli:"SAMY",neto:104957058,costoPct:7.0,ventaPct:9.0,aPagar:7346994,perc:0,aCobrar:9446135,bille:0,ganancia:2099141},
  {mes:"ENE",fecha:"",proveedor:"IONI S (SIN)",contactoProv:"HOMETEX",cliente:"LAUTIN",contactoCli:"GUIDO S",neto:60000000,costoPct:6.0,ventaPct:6.4,aPagar:3600000,perc:0,aCobrar:3840000,bille:0,ganancia:240000},
  {mes:"ENE",fecha:"",proveedor:"IONI S (SIN)",contactoProv:"HOMETEX",cliente:"DAPICE CAROLINA",contactoCli:"NESU",neto:6650000,costoPct:6.0,ventaPct:7.25,aPagar:399000,perc:0,aCobrar:482125,bille:0,ganancia:83125},
  {mes:"ENE",fecha:"",proveedor:"IONI S (SIN)",contactoProv:"HOMETEX",cliente:"ADELA GOMEZ",contactoCli:"ZAQUI H",neto:8264500,costoPct:5.0,ventaPct:6.0,aPagar:413225,perc:0,aCobrar:495870,bille:0,ganancia:82645},
  {mes:"ENE",fecha:"",proveedor:"IONI S (SIN)",contactoProv:"HOMETEX",cliente:"GRACI CRISTINA ISBAEL",contactoCli:"ZAQUI H",neto:1700000,costoPct:5.0,ventaPct:6.0,aPagar:85000,perc:0,aCobrar:102000,bille:0,ganancia:17000},
  {mes:"ENE",fecha:"",proveedor:"IONI S (SIN)",contactoProv:"HOMETEX",cliente:"DETEX SRL",contactoCli:"GABI HOMSANI",neto:20000000,costoPct:6.0,ventaPct:7.0,aPagar:1200000,perc:0,aCobrar:1400000,bille:0,ganancia:200000},
  {mes:"ENE",fecha:"",proveedor:"DAN DABBAH",contactoProv:"TEDATEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:28925619,costoPct:6.0,ventaPct:8.5,aPagar:1735537,perc:0,aCobrar:2458678,bille:87500,ganancia:810640},
  {mes:"ENE",fecha:"27/01/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:6611570,costoPct:6.0,ventaPct:8.0,aPagar:396694,perc:0,aCobrar:528926,bille:17500,ganancia:149731},
  {mes:"ENE",fecha:"29/01/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:16528925,costoPct:6.0,ventaPct:8.0,aPagar:991736,perc:0,aCobrar:1322314,bille:0,ganancia:330578},
  {mes:"ENE",fecha:"30/01/26",proveedor:"DAN DABBAH",contactoProv:"TEDATEX",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:23966540,costoPct:6.0,ventaPct:8.0,aPagar:1437992,perc:0,aCobrar:1917323,bille:127610,ganancia:606941},
  {mes:"ENE",fecha:"30/01/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"PINARES",contactoCli:"ALAN IRADE",neto:16528926,costoPct:6.0,ventaPct:7.0,aPagar:991736,perc:0,aCobrar:1157025,bille:0,ganancia:165289},
  {mes:"ENE",fecha:"01/02/26",proveedor:"MARQUI D",contactoProv:"UNICI",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:16528926,costoPct:6.0,ventaPct:8.0,aPagar:991736,perc:0,aCobrar:1322314,bille:0,ganancia:330579},
  {mes:"FEB",fecha:"06/02/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264500,costoPct:6.0,ventaPct:8.0,aPagar:495870,perc:0,aCobrar:661160,bille:0,ganancia:165290},
  {mes:"FEB",fecha:"12/02/26",proveedor:"GABI DABBAH",contactoProv:"MANATEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:14049586,costoPct:6.5,ventaPct:8.5,aPagar:913223,perc:0,aCobrar:1194215,bille:0,ganancia:280992},
  {mes:"FEB",fecha:"12/02/26",proveedor:"IONI HAMBRA",contactoProv:"HAMELEJ",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"FEB",fecha:"22/02/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"FEB",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"D FERREIRO",contactoCli:"D FERREIRO",neto:20000000,costoPct:5.0,ventaPct:8.5,aPagar:1000000,perc:0,aCobrar:1700000,bille:0,ganancia:700000},
  {mes:"FEB",fecha:"24/02/26",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:28946505,costoPct:6.0,ventaPct:9.952,aPagar:1736790,perc:0,aCobrar:2880756,bille:110000,ganancia:1253966},
  {mes:"FEB",fecha:"24/02/26",proveedor:"ELIAHU LEVY",contactoProv:"LEVY NAOMI",cliente:"VARIOS",contactoCli:"GASTON FALLAS",neto:30000000,costoPct:6.5,ventaPct:8.0,aPagar:1950000,perc:0,aCobrar:2400000,bille:0,ganancia:450000},
  {mes:"FEB",fecha:"",proveedor:"ISAAC SALEM BH",contactoProv:"COTTONTEL",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:20000000,costoPct:6.5,ventaPct:8.5,aPagar:1300000,perc:0,aCobrar:1700000,bille:0,ganancia:400000},
  {mes:"FEB",fecha:"",proveedor:"ISAAC SALEM BH",contactoProv:"COTTONTEL",cliente:"HOREN",contactoCli:"EZEQUIEL ALTARAS",neto:3350000,costoPct:6.5,ventaPct:8.5,aPagar:217750,perc:0,aCobrar:284750,bille:0,ganancia:67000},
  {mes:"FEB",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"LAUTIN",contactoCli:"GUIDO S",neto:60000000,costoPct:5.0,ventaPct:6.5,aPagar:3900000,perc:1.5,aCobrar:4800000,bille:0,ganancia:900000},
  {mes:"FEB",fecha:"02/03/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"FEB",fecha:"02/03/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"FEB",fecha:"",proveedor:"SEBASTIÁN MENALLED",contactoProv:"MASTER",cliente:"SORPRESAS SAS",contactoCli:"EZE MICHANIE",neto:58851239,costoPct:6.0,ventaPct:7.0,aPagar:3531074,perc:0,aCobrar:4119587,bille:0,ganancia:588512},
  {mes:"FEB",fecha:"",proveedor:"VIVI SELEM",contactoProv:"CANDALAR",cliente:"WEBCOM",contactoCli:"SAMY",neto:30000000,costoPct:6.0,ventaPct:9.0,aPagar:1800000,perc:0,aCobrar:2700000,bille:0,ganancia:900000},
  {mes:"FEB",fecha:"",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"Alonso",contactoCli:"JOSI MIZRAHI",neto:1000000,costoPct:6.0,ventaPct:8.0,aPagar:60000,perc:0,aCobrar:80000,bille:0,ganancia:20000},
  {mes:"FEB",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"Posto 5",contactoCli:"ANA MIZRAHI",neto:60000000,costoPct:5.0,ventaPct:6.5,aPagar:3600000,perc:1.0,aCobrar:4500000,bille:0,ganancia:900000},
  {mes:"FEB",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"Johlimar Pinto",contactoCli:"Iair Hambra",neto:17012199,costoPct:5.0,ventaPct:7.0,aPagar:1020732,perc:1.0,aCobrar:1360976,bille:0,ganancia:340244},
  {mes:"FEB",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"Triunvirato",contactoCli:"DAMIÁN MICHANIE",neto:8000000,costoPct:5.0,ventaPct:7.0,aPagar:640000,perc:3.0,aCobrar:800000,bille:0,ganancia:160000},
  {mes:"FEB",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"WEBCOM",contactoCli:"SAMY",neto:20000000,costoPct:7.5,ventaPct:9.0,aPagar:1500000,perc:0,aCobrar:1800000,bille:0,ganancia:300000},
  {mes:"MAR",fecha:"04/03/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:4985677,costoPct:6.0,ventaPct:8.0,aPagar:299141,perc:0,aCobrar:398854,bille:0,ganancia:99714},
  {mes:"MAR",fecha:"11/03/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"MAR",fecha:"",proveedor:"SEBASTIÁN MENALLED",contactoProv:"",cliente:"SORPRESAS SAS",contactoCli:"EZE MICHANIE",neto:67768595,costoPct:6.0,ventaPct:7.0,aPagar:4066116,perc:0,aCobrar:4743802,bille:0,ganancia:677686},
  {mes:"MAR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BUCHWALD",contactoCli:"JIMMY (Augusto)",neto:30000000,costoPct:5.0,ventaPct:7.5,aPagar:1800000,perc:1.0,aCobrar:2550000,bille:0,ganancia:750000},
  {mes:"MAR",fecha:"23/03/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"MAR",fecha:"25/03/26",proveedor:"MARQUI D",contactoProv:"UNICI",cliente:"COOPERATIVA",contactoCli:"ALE MBAZBAZ",neto:42198977,costoPct:6.0,ventaPct:8.0,aPagar:2531939,perc:0,aCobrar:3375918,bille:0,ganancia:843980},
  {mes:"MAR",fecha:"",proveedor:"VIVI SELEM",contactoProv:"MAZON",cliente:"WEBCOM",contactoCli:"SAMY",neto:100000000,costoPct:6.0,ventaPct:9.0,aPagar:6000000,perc:0,aCobrar:9000000,bille:0,ganancia:3000000},
  {mes:"MAR",fecha:"26/03/26",proveedor:"IAIR CHAIENO",contactoProv:"IMPULSO TEXTIL",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:32765,ganancia:198054},
  {mes:"MAR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"FAMICAR",contactoCli:"DAN MIZRAHI",neto:20000000,costoPct:5.0,ventaPct:8.0,aPagar:1000000,perc:0,aCobrar:1600000,bille:0,ganancia:600000},
  {mes:"MAR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"D FERREIRO",contactoCli:"D FERREIRO",neto:10043185,costoPct:5.0,ventaPct:8.5,aPagar:803455,perc:3.0,aCobrar:1154966,bille:0,ganancia:351511},
  {mes:"MAR",fecha:"",proveedor:"MARTIN D",contactoProv:"DIM",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264463,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:32765,ganancia:198054},
  {mes:"MAR",fecha:"31/03/26",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:18459060,costoPct:6.0,ventaPct:9.95,aPagar:1107544,perc:0,aCobrar:1836676,bille:0,ganancia:729133},
  {mes:"MAR",fecha:"31/03/26",proveedor:"MARTIN D",contactoProv:"DIM",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:45454545,costoPct:6.0,ventaPct:8.0,aPagar:2727273,perc:0,aCobrar:3636364,bille:96000,ganancia:1005091},
  {mes:"MAR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"CHILCAL",contactoCli:"BH SALEM",neto:90000000,costoPct:5.0,ventaPct:6.0,aPagar:4500000,perc:0,aCobrar:5400000,bille:0,ganancia:900000},
  {mes:"MAR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"MARIANA SA",contactoCli:"YONI SALEM",neto:130000000,costoPct:5.0,ventaPct:7.0,aPagar:7800000,perc:1.0,aCobrar:10400000,bille:0,ganancia:2600000},
  {mes:"MAR",fecha:"",proveedor:"ELIAHU LEVY",contactoProv:"LEVY NAOMI",cliente:"CARRASCO",contactoCli:"NESU",neto:4000000,costoPct:6.5,ventaPct:9.3,aPagar:260000,perc:0,aCobrar:372000,bille:0,ganancia:112000},
  {mes:"ABR",fecha:"05/04/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:16528925,costoPct:6.0,ventaPct:8.0,aPagar:991736,perc:0,aCobrar:1322314,bille:0,ganancia:330578},
  {mes:"ABR",fecha:"10/04/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"ABR",fecha:"17/04/26",proveedor:"URI DABBAH",contactoProv:"URI DABBAH",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:4958678,costoPct:6.0,ventaPct:8.0,aPagar:297521,perc:0,aCobrar:396694,bille:0,ganancia:99174},
  {mes:"ABR",fecha:"19/04/26",proveedor:"URI DABBAH",contactoProv:"URI DABBAH",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:4958678,costoPct:6.0,ventaPct:8.0,aPagar:297521,perc:0,aCobrar:396694,bille:0,ganancia:99174},
  {mes:"ABR",fecha:"23/04/26",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:26839760,costoPct:6.0,ventaPct:9.95,aPagar:1610386,perc:0,aCobrar:2670556,bille:0,ganancia:1060171},
  {mes:"ABR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BUCHWALD",contactoCli:"JIMMY (Augusto)",neto:45000000,costoPct:5.0,ventaPct:7.5,aPagar:2700000,perc:1.0,aCobrar:3825000,bille:0,ganancia:1125000},
  {mes:"ABR",fecha:"24/04/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"LAUTIN",contactoCli:"GUIDO S",neto:43058276,costoPct:6.0,ventaPct:7.5,aPagar:2583497,perc:0,aCobrar:3229371,bille:0,ganancia:645874},
  {mes:"ABR",fecha:"24/04/26",proveedor:"IONA BEHAR",contactoProv:"REPUBLICA",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:4132232,costoPct:5.0,ventaPct:8.0,aPagar:206612,perc:0,aCobrar:330579,bille:0,ganancia:123967},
  {mes:"ABR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"ZISEL",contactoCli:"EZE MICHANIE",neto:75000000,costoPct:5.0,ventaPct:6.5,aPagar:7500000,perc:5.0,aCobrar:8625000,bille:0,ganancia:1125000},
  {mes:"ABR",fecha:"",proveedor:"ELIAHU LEVY",contactoProv:"LEVY NAOMI",cliente:"VARIOS",contactoCli:"GASTON FALLAS",neto:26954362,costoPct:6.5,ventaPct:8.0,aPagar:1752034,perc:0,aCobrar:2156349,bille:0,ganancia:404315},
  {mes:"ABR",fecha:"",proveedor:"LACHA",contactoProv:"EL MONO LOCO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:7702480,costoPct:5.5,ventaPct:8.0,aPagar:423636,perc:0,aCobrar:616198,bille:34000,ganancia:226562},
  {mes:"ABR",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"LAVALLE COMERCIAL",contactoCli:"GUILLE DEL BRUTO",neto:20002571,costoPct:5.0,ventaPct:7.0,aPagar:1000129,perc:0,aCobrar:1400180,bille:0,ganancia:400051},
  {mes:"ABR",fecha:"",proveedor:"LACHA",contactoProv:"EL MONO LOCO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:4619009,costoPct:6.0,ventaPct:8.0,aPagar:277141,perc:0,aCobrar:369521,bille:16000,ganancia:108380},
  {mes:"ABR",fecha:"",proveedor:"IONA BEHAR",contactoProv:"REPUBLICA",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:75000000,costoPct:6.5,ventaPct:7.5,aPagar:4875000,perc:0,aCobrar:5625000,bille:0,ganancia:750000},
  {mes:"ABR",fecha:"05/05/26",proveedor:"IONA BEHAR",contactoProv:"REPUBLICA",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:4132231,costoPct:7.0,ventaPct:8.5,aPagar:289256,perc:0,aCobrar:351240,bille:0,ganancia:61983},
  {mes:"ABR",fecha:"",proveedor:"ABI FREUE",contactoProv:"LULABIM",cliente:"VARGAS",contactoCli:"JOSI MIZRAHI",neto:2385000,costoPct:6.0,ventaPct:8.0,aPagar:143100,perc:0,aCobrar:190800,bille:0,ganancia:47700},
  {mes:"ABR",fecha:"",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"WEBCOM",contactoCli:"SAMY",neto:10000000,costoPct:6.0,ventaPct:9.0,aPagar:600000,perc:0,aCobrar:900000,bille:0,ganancia:300000},
  {mes:"ABR",fecha:"06/05/26",proveedor:"IONA BEHAR",contactoProv:"ILATEX",cliente:"BENJATEX",contactoCli:"ALE MBAZBAZ",neto:4132260,costoPct:6.5,ventaPct:8.0,aPagar:268597,perc:0,aCobrar:330581,bille:0,ganancia:61984},
  {mes:"MAY",fecha:"13/05/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:23165029,costoPct:6.0,ventaPct:9.27,aPagar:1389902,perc:0,aCobrar:2147398,bille:0,ganancia:757496},
  {mes:"MAY",fecha:"18/05/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"LAUTIN",contactoCli:"GUIDO S",neto:41322376,costoPct:6.0,ventaPct:7.5,aPagar:2479343,perc:0,aCobrar:3099178,bille:0,ganancia:619836},
  {mes:"ABR",fecha:"21/05/26",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"LAUTIN",contactoCli:"GUIDO S",neto:41322375,costoPct:6.0,ventaPct:7.5,aPagar:2479342,perc:0,aCobrar:3099178,bille:0,ganancia:619836},
  {mes:"MAY",fecha:"26/05/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:26033057,costoPct:6.0,ventaPct:8.0,aPagar:1561983,perc:0,aCobrar:2082645,bille:0,ganancia:520661},
  {mes:"MAY",fecha:"",proveedor:"JOSI META",contactoProv:"JOSOBI",cliente:"VARIOS",contactoCli:"YONI YABO",neto:51993683,costoPct:5.5,ventaPct:7.0,aPagar:2859653,perc:0,aCobrar:3639558,bille:0,ganancia:779905},
  {mes:"MAY",fecha:"",proveedor:"JOSI META",contactoProv:"JOSOBI",cliente:"PÚRPURA",contactoCli:"YIMY",neto:87035189,costoPct:5.5,ventaPct:6.5,aPagar:4786935,perc:0,aCobrar:5657287,bille:0,ganancia:870352},
  {mes:"MAY",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"MAGNIFICA",contactoCli:"ZAQUI H",neto:90000000,costoPct:5.5,ventaPct:7.0,aPagar:4950000,perc:0,aCobrar:6300000,bille:0,ganancia:1350000},
  {mes:"MAY",fecha:"",proveedor:"VIVI SELEM",contactoProv:"MAZON",cliente:"WEBCOM",contactoCli:"SAMY",neto:80692630,costoPct:7.0,ventaPct:9.5,aPagar:5648484,perc:0,aCobrar:7665800,bille:0,ganancia:2017316},
  {mes:"MAY",fecha:"02/06/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"BUCHWALD",contactoCli:"JIMMY (Augusto)",neto:5785123,costoPct:6.0,ventaPct:8.5,aPagar:347107,perc:0,aCobrar:491735,bille:0,ganancia:144628},
  {mes:"MAY",fecha:"",proveedor:"ELIAHU LEVY",contactoProv:"LEVY NAOMI",cliente:"VARIOS",contactoCli:"GASTON FALLAS",neto:19800826,costoPct:6.5,ventaPct:8.0,aPagar:1287054,perc:0,aCobrar:1584066,bille:0,ganancia:297012},
  {mes:"MAY",fecha:"",proveedor:"ARIEL FALAK",contactoProv:"BINIAN AB",cliente:"BRELIO MARIANO",contactoCli:"BRELIO MARIANO",neto:12500000,costoPct:7.0,ventaPct:8.0,aPagar:875000,perc:0,aCobrar:1000000,bille:0,ganancia:125000},
  {mes:"JUN",fecha:"01/06/26",proveedor:"MARQUI D",contactoProv:"UNICI",cliente:"TECHFABRICS",contactoCli:"ALE OHANA",neto:66115000,costoPct:6.0,ventaPct:8.5,aPagar:3966900,perc:0,aCobrar:5619775,bille:259360,ganancia:1912235},
  {mes:"JUN",fecha:"02/06/26",proveedor:"ZEBULUN",contactoProv:"URI DABBAH",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:2479338,costoPct:6.0,ventaPct:8.0,aPagar:148760,perc:0,aCobrar:198347,bille:0,ganancia:49587},
  {mes:"JUN",fecha:"17/06/26",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:30714580,costoPct:6.0,ventaPct:9.95,aPagar:1842875,perc:0,aCobrar:3056101,bille:0,ganancia:1213226},
  {mes:"JUN",fecha:"18/06/26",proveedor:"ARON FREUE",contactoProv:"CLADD",cliente:"MTEX",contactoCli:"ALE OHANA",neto:17241265,costoPct:7.3,ventaPct:8.5,aPagar:1258612,perc:0,aCobrar:1465508,bille:0,ganancia:206895},
  {mes:"JUN",fecha:"18/06/26",proveedor:"ARON FREUE",contactoProv:"AUSTRALTEX",cliente:"TECHFABRICS",contactoCli:"ALE OHANA",neto:138306636,costoPct:7.3,ventaPct:8.5,aPagar:10096384,perc:0,aCobrar:11756064,bille:0,ganancia:1659680},
  {mes:"JUN",fecha:"",proveedor:"ELIAHU LEVY",contactoProv:"LEVY NAOMI",cliente:"VARIOS",contactoCli:"GASTON FALLAS",neto:19880000,costoPct:6.5,ventaPct:8.0,aPagar:1292200,perc:0,aCobrar:1590400,bille:0,ganancia:298200},
  {mes:"JUN",fecha:"",proveedor:"SUS",contactoProv:"CHICHU",cliente:"PÚRPURA",contactoCli:"YIMY",neto:200000000,costoPct:6.5,ventaPct:7.5,aPagar:13000000,perc:0,aCobrar:15000000,bille:0,ganancia:2000000},
  {mes:"JUN",fecha:"",proveedor:"ABI ABOUD",contactoProv:"TURCOTEX",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:33057852,costoPct:6.5,ventaPct:8.0,aPagar:2148760,perc:0,aCobrar:2644628,bille:0,ganancia:495868},
  {mes:"JUN",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"MAGIC",contactoCli:"ANA MIZRAHI",neto:190000000,costoPct:6.5,ventaPct:8.0,aPagar:12350000,perc:0,aCobrar:15200000,bille:0,ganancia:2850000},
  {mes:"JUN",fecha:"24/06/26",proveedor:"ARON FREUE",contactoProv:"CLADD",cliente:"Posto 5",contactoCli:"ANA MIZRAHI",neto:207438016,costoPct:7.3,ventaPct:8.5,aPagar:15142975,perc:0,aCobrar:17632231,bille:75423,ganancia:2564679},
  {mes:"JUN",fecha:"",proveedor:"DANI SADRINAS",contactoProv:"BADISUR",cliente:"WEBCOM",contactoCli:"SAMY",neto:100000000,costoPct:7.0,ventaPct:9.0,aPagar:8500000,perc:1.5,aCobrar:10500000,bille:0,ganancia:2000000},
  {mes:"JUN",fecha:"",proveedor:"VIVI SELEM",contactoProv:"CANDALAR",cliente:"WEBCOM",contactoCli:"SAMY",neto:100000000,costoPct:6.5,ventaPct:9.0,aPagar:6500000,perc:0,aCobrar:9000000,bille:0,ganancia:2500000},
  {mes:"JUN",fecha:"",proveedor:"VIVI SELEM",contactoProv:"CANDALAR",cliente:"PÚRPURA",contactoCli:"YIMY",neto:150000000,costoPct:6.5,ventaPct:7.5,aPagar:9750000,perc:0,aCobrar:11250000,bille:0,ganancia:1500000},
  {mes:"JUN",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BENADERETTE",contactoCli:"YONI SALEM",neto:85000000,costoPct:6.5,ventaPct:7.75,aPagar:6375000,perc:1.0,aCobrar:7437500,bille:0,ganancia:1062500},
  {mes:"JUN",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:8500000,costoPct:6.5,ventaPct:8.0,aPagar:552500,perc:0,aCobrar:680000,bille:0,ganancia:127500},
  {mes:"JUN",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BRELIO MARIANO",contactoCli:"BRELIO MARIANO",neto:12501291,costoPct:6.5,ventaPct:8.0,aPagar:937597,perc:1.0,aCobrar:1125116,bille:0,ganancia:187519},
  {mes:"JUN",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BRELIO VERONICA",contactoCli:"GUILLE DEL BRUTO",neto:3001383,costoPct:6.0,ventaPct:8.0,aPagar:180083,perc:0,aCobrar:240111,bille:0,ganancia:60028},
  {mes:"JUN",fecha:"",proveedor:"ARON FREUE",contactoProv:"COMERCIAL FREEDAY",cliente:"BENDOD",contactoCli:"AXEL SAFDIE",neto:41322395,costoPct:7.0,ventaPct:8.0,aPagar:2892568,perc:0,aCobrar:3305792,bille:0,ganancia:413224},
  {mes:"JUN",fecha:"01/07/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"LEVY",contactoCli:"ALAN IRADE",neto:24800000,costoPct:6.0,ventaPct:8.0,aPagar:1488000,perc:0,aCobrar:1984000,bille:0,ganancia:496000},
  {mes:"JUN",fecha:"",proveedor:"DAMIAN COHEN",contactoProv:"SUOMATOK",cliente:"NISIM ELIEL",contactoCli:"PRIMO NESU BB",neto:4000000,costoPct:7.0,ventaPct:10.0,aPagar:280000,perc:0,aCobrar:400000,bille:0,ganancia:120000},
  {mes:"JUN",fecha:"",proveedor:"JOSI META",contactoProv:"JOSOBI",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:28920540,costoPct:5.5,ventaPct:8.0,aPagar:1590630,perc:0,aCobrar:2313643,bille:0,ganancia:723014},
  {mes:"JUN",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"LAVALLE COMERCIAL",contactoCli:"GUILLE DEL BRUTO",neto:25000000,costoPct:6.5,ventaPct:8.0,aPagar:1625000,perc:0,aCobrar:2000000,bille:0,ganancia:375000},
  {mes:"JUN",fecha:"",proveedor:"ARIEL FALAK",contactoProv:"BINIAN AB",cliente:"ELORDI IRENE",contactoCli:"EZE MICHANIE",neto:12045314,costoPct:7.0,ventaPct:8.5,aPagar:843172,perc:0,aCobrar:1023852,bille:0,ganancia:180680},
  {mes:"JUN",fecha:"",proveedor:"ARIEL FALAK",contactoProv:"BINIAN AB",cliente:"CHINELLATO",contactoCli:"EZE MICHANIE",neto:1500000,costoPct:7.0,ventaPct:8.5,aPagar:105000,perc:0,aCobrar:127500,bille:0,ganancia:22500},
  {mes:"JUL",fecha:"16/07/26",proveedor:"ARON FREUE",contactoProv:"AUSTRALTEX",cliente:"TECHFABRICS",contactoCli:"ALE OHANA",neto:63471075,costoPct:7.3,ventaPct:8.5,aPagar:4633388,perc:0,aCobrar:5395041,bille:90000,ganancia:851653},
  {mes:"JUL",fecha:"16/07/26",proveedor:"ARON FREUE",contactoProv:"CLADD",cliente:"TECHFABRICS",contactoCli:"ALE OHANA",neto:15867769,costoPct:7.3,ventaPct:8.5,aPagar:1158347,perc:0,aCobrar:1348760,bille:0,ganancia:190413},
  {mes:"JUL",fecha:"27/07/26",proveedor:"URI DABBAH",contactoProv:"ZEBULUN",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264463,costoPct:6.0,ventaPct:8.0,aPagar:495868,perc:0,aCobrar:661157,bille:0,ganancia:165289},
  {mes:"JUL",fecha:"",proveedor:"VIVI SELEM",contactoProv:"CANDALAR",cliente:"WEBCOM",contactoCli:"SAMY",neto:130000000,costoPct:6.5,ventaPct:9.0,aPagar:8450000,perc:0,aCobrar:11700000,bille:0,ganancia:3250000},
  {mes:"JUL",fecha:"",proveedor:"ARON FREUE",contactoProv:"COMERCIAL FREEDAY",cliente:"D FERREIRO",contactoCli:"D FERREIRO",neto:10000000,costoPct:7.0,ventaPct:9.5,aPagar:700000,perc:0,aCobrar:950000,bille:0,ganancia:250000},
  {mes:"JUL",fecha:"",proveedor:"ARON FREUE",contactoProv:"REVAJH",cliente:"DE BLANCO SRL",contactoCli:"Cintia Gontmaher (Eliahu levy)",neto:8590258,costoPct:7.0,ventaPct:8.5,aPagar:601318,perc:0,aCobrar:730172,bille:0,ganancia:128854},
  {mes:"JUL",fecha:"",proveedor:"ARON FREUE",contactoProv:"KATARINA",cliente:"DE BLANCO SRL",contactoCli:"Cintia Gontmaher (Eliahu levy)",neto:12398352,costoPct:7.0,ventaPct:8.5,aPagar:867885,perc:0,aCobrar:1053860,bille:0,ganancia:185975},
  {mes:"JUL",fecha:"29/07/26",proveedor:"ABI FREUE",contactoProv:"CLADD",cliente:"TECHFABRICS",contactoCli:"ALE OHANA",neto:51239669,costoPct:7.15,ventaPct:8.5,aPagar:3663636,perc:0,aCobrar:4355372,bille:0,ganancia:691736},
  {mes:"JUL",fecha:"29/07/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"EMPERATO",contactoCli:"AUGUSTO BRELIO",neto:28925620,costoPct:6.5,ventaPct:8.5,aPagar:1880165,perc:0,aCobrar:2458678,bille:0,ganancia:578512},
  {mes:"JUL",fecha:"01/08/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:9090909,costoPct:6.0,ventaPct:8.5,aPagar:545455,perc:0,aCobrar:772727,bille:0,ganancia:227273},
  {mes:"JUL",fecha:"",proveedor:"JOSI TAWIL",contactoProv:"GRANDI",cliente:"ZAYAT TEÓFILO",contactoCli:"RAFI DABBAH",neto:7936800,costoPct:6.0,ventaPct:7.0,aPagar:476208,perc:0,aCobrar:555576,bille:0,ganancia:79368},
  {mes:"JUL",fecha:"",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"PÚRPURA",contactoCli:"YIMY",neto:41322376,costoPct:6.5,ventaPct:7.5,aPagar:2685954,perc:0,aCobrar:3099178,bille:0,ganancia:413224},
  {mes:"JUL",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BUCHWALD",contactoCli:"JIMMY (Augusto)",neto:25301302,costoPct:6.5,ventaPct:8.0,aPagar:2403624,perc:3.0,aCobrar:2783143,bille:0,ganancia:379520},
  {mes:"JUL",fecha:"",proveedor:"ARON FREUE",contactoProv:"RINGTEL",cliente:"PÚRPURA",contactoCli:"YIMY",neto:16530950,costoPct:7.0,ventaPct:8.0,aPagar:1157166,perc:0,aCobrar:1322476,bille:0,ganancia:165310},
  {mes:"JUL",fecha:"",proveedor:"ARON FREUE",contactoProv:"RINGTEL",cliente:"PÚRPURA",contactoCli:"KIKO",neto:8238598,costoPct:7.0,ventaPct:8.0,aPagar:576702,perc:0,aCobrar:659088,bille:0,ganancia:82386},
  {mes:"JUL",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"SUTELAR",contactoCli:"AUGUSTO BRELIO",neto:28925620,costoPct:7.0,ventaPct:8.0,aPagar:2024793,perc:0,aCobrar:2314050,bille:0,ganancia:289256},
  {mes:"JUL",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"D FERREIRO",contactoCli:"D FERREIRO",neto:10000000,costoPct:7.0,ventaPct:8.5,aPagar:1000000,perc:3.0,aCobrar:1150000,bille:0,ganancia:150000},
  {mes:"JUL",fecha:"",proveedor:"IONI HAMBRA",contactoProv:"HAMELEJ",cliente:"CHEMEA ADELA",contactoCli:"NATAN SERUR",neto:2024000,costoPct:6.5,ventaPct:8.0,aPagar:131560,perc:0,aCobrar:161920,bille:0,ganancia:30360},
  {mes:"JUL",fecha:"",proveedor:"IONI HAMBRA",contactoProv:"HAMELEJ",cliente:"FRATELLO",contactoCli:"EZE MICHANIE",neto:15050000,costoPct:6.5,ventaPct:8.0,aPagar:978250,perc:0,aCobrar:1204000,bille:0,ganancia:225750},
  {mes:"AGO",fecha:"",proveedor:"ABI ABOUD",contactoProv:"CHELATEX",cliente:"WEBCOM",contactoCli:"SAMY",neto:47190220,costoPct:6.5,ventaPct:9.0,aPagar:3067364,perc:0,aCobrar:4247120,bille:0,ganancia:1179756},
  {mes:"AGO",fecha:"25/08/26",proveedor:"ARON FREUE",contactoProv:"AUSTRALTEX",cliente:"KEMINI",contactoCli:"SANTIAGO MASSRI",neto:245948826,costoPct:7.15,ventaPct:8.5,aPagar:17585341,perc:0,aCobrar:20905650,bille:0,ganancia:3320309},
  {mes:"AGO",fecha:"25/08/26",proveedor:"ARON FREUE",contactoProv:"CLADD",cliente:"KEMINI",contactoCli:"SANTIAGO MASSRI",neto:61487206,costoPct:7.15,ventaPct:8.5,aPagar:4396335,perc:0,aCobrar:5226413,bille:0,ganancia:830077},
  {mes:"AGO",fecha:"01/09/26",proveedor:"ARON FREUE",contactoProv:"AUSTRALTEX",cliente:"TALLERES FENIX",contactoCli:"DAVID FAHAM",neto:19834876,costoPct:7.15,ventaPct:8.5,aPagar:1418194,perc:0,aCobrar:1685964,bille:0,ganancia:267771},
  {mes:"AGO",fecha:"01/09/26",proveedor:"ARON FREUE",contactoProv:"CLADD",cliente:"TALLERES FENIX",contactoCli:"DAVID FAHAM",neto:4958719,costoPct:7.15,ventaPct:8.5,aPagar:354548,perc:0,aCobrar:421491,bille:0,ganancia:66943},
  {mes:"AGO",fecha:"01/08/26",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:9090909,costoPct:6.0,ventaPct:8.0,aPagar:545455,perc:0,aCobrar:727273,bille:0,ganancia:181818},
  {mes:"AGO",fecha:"16/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:15702479,costoPct:7.0,ventaPct:8.0,aPagar:1099174,perc:0,aCobrar:1256198,bille:0,ganancia:157025},
  {mes:"AGO",fecha:"19/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:8264462,costoPct:7.0,ventaPct:8.0,aPagar:578512,perc:0,aCobrar:661157,bille:0,ganancia:82645},
  {mes:"AGO",fecha:"19/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:4132231,costoPct:7.0,ventaPct:8.0,aPagar:289256,perc:0,aCobrar:330578,bille:0,ganancia:41322},
  {mes:"AGO",fecha:"24/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:5785123,costoPct:7.0,ventaPct:8.0,aPagar:404959,perc:0,aCobrar:462810,bille:0,ganancia:57851},
  {mes:"AGO",fecha:"29/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"MASTER",contactoCli:"SEBASTIAN M",neto:17355371,costoPct:7.0,ventaPct:8.0,aPagar:1214876,perc:0,aCobrar:1388430,bille:0,ganancia:173554},
  {mes:"AGO",fecha:"19/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"LARZABAL",contactoCli:"JOEL MENALLED",neto:7553105,costoPct:7.0,ventaPct:8.0,aPagar:528717,perc:0,aCobrar:604248,bille:0,ganancia:75531},
  {mes:"AGO",fecha:"19/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"MERCEDES MURILLO",contactoCli:"JOEL MENALLED",neto:857818,costoPct:7.0,ventaPct:8.0,aPagar:60047,perc:0,aCobrar:68625,bille:0,ganancia:8578},
  {mes:"AGO",fecha:"19/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"LA SANTINA",contactoCli:"JOEL MENALLED",neto:2479338,costoPct:7.0,ventaPct:8.0,aPagar:173554,perc:0,aCobrar:198347,bille:0,ganancia:24793},
  {mes:"AGO",fecha:"26/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"DAMIAN FUCHS",contactoCli:"JOEL MENALLED",neto:14999879,costoPct:7.0,ventaPct:8.0,aPagar:1049992,perc:0,aCobrar:1199990,bille:0,ganancia:149999},
  {mes:"AGO",fecha:"26/08/26",proveedor:"LEO JAFIF",contactoProv:"LEALTEX",cliente:"DAMIAN FUCHS",contactoCli:"JOEL MENALLED",neto:13000800,costoPct:7.0,ventaPct:8.0,aPagar:910056,perc:0,aCobrar:1040064,bille:0,ganancia:130008},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"CHEMEA ADELA",contactoCli:"NATAN SERUR",neto:1884609,costoPct:6.0,ventaPct:8.0,aPagar:113077,perc:0,aCobrar:150769,bille:0,ganancia:37692},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"SOOKOIAN DARIO CHRISTIAN",contactoCli:"ALE MBAZBAZ",neto:9166565,costoPct:6.0,ventaPct:8.0,aPagar:1008322,perc:5.0,aCobrar:1191653,bille:0,ganancia:183331},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"MARCARIAN MARGARITA",contactoCli:"ALE MBAZBAZ",neto:7322990,costoPct:6.0,ventaPct:8.0,aPagar:878759,perc:6.0,aCobrar:1025219,bille:0,ganancia:146460},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"TEXTIL TRIUNVIRATO",contactoCli:"DAMIÁN MICHANIE",neto:21001050,costoPct:5.0,ventaPct:6.0,aPagar:1680084,perc:3.0,aCobrar:1890094,bille:0,ganancia:210010},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"RGSMTEC SRL",contactoCli:"DAMIÁN MICHANIE",neto:15001157,costoPct:5.0,ventaPct:6.0,aPagar:1500116,perc:5.0,aCobrar:1650127,bille:0,ganancia:150012},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"FERREIRO RICARDO DANIEL",contactoCli:"D FERREIRO",neto:10000236,costoPct:6.0,ventaPct:8.5,aPagar:900021,perc:3.0,aCobrar:1150027,bille:0,ganancia:250006},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BUCHWALD",contactoCli:"JIMMY (Augusto)",neto:20006072,costoPct:6.0,ventaPct:8.0,aPagar:1800546,perc:3.0,aCobrar:2200668,bille:0,ganancia:400121},
  {mes:"AGO",fecha:"",proveedor:"YIMY",contactoProv:"PURPURA",cliente:"BENJATEX",contactoCli:"ALE MBAZBAZ",neto:10001992,costoPct:6.0,ventaPct:8.0,aPagar:1100219,perc:5.0,aCobrar:1300259,bille:0,ganancia:200040},
  {mes:"AGO",fecha:"",proveedor:"SEBASTIÁN MENALLED",contactoProv:"MASTER",cliente:"PÚRPURA",contactoCli:"YIMY",neto:49586783,costoPct:6.0,ventaPct:7.0,aPagar:2975207,perc:0,aCobrar:3471075,bille:0,ganancia:495868},
  {mes:"AGO",fecha:"",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"EFECTO GRAFICO",contactoCli:"ARIEL MBAZBAZ",neto:19997200,costoPct:6.0,ventaPct:8.5,aPagar:1199832,perc:0,aCobrar:1699762,bille:0,ganancia:499930},
  {mes:"AGO",fecha:"",proveedor:"EZE M",contactoProv:"FRATELLO",cliente:"GUADAL",contactoCli:"ARIEL MBAZBAZ",neto:11063200,costoPct:6.0,ventaPct:8.5,aPagar:663792,perc:0,aCobrar:940372,bille:0,ganancia:276580},
].map((m,i)=>({...m,id:"seed-"+i}));

const SEED_GANANCIA_MES = {ENE:10421747,FEB:8087161,MAR:12395801,ABR:7755038,MAY:7482207,JUN:23018334,JUL:8243310,AGO:0,SEP:0,OCT:0,NOV:0,DIC:0};

const DEFAULT_COLUMNS = {fecha:true,proveedor:true,cliente:true,neto:true,costoPct:false,ventaPct:false,aPagar:true,perc:false,aCobrar:true,bille:false,ganancia:true};

const DEFAULT_DATA = {
  movements: SEED_MOVEMENTS,
  checks: [],
  entities: {
    providers: Array.from(new Set(SEED_MOVEMENTS.map(m=>m.proveedor))),
    clients: Array.from(new Set(SEED_MOVEMENTS.map(m=>m.cliente))),
    contactosProv: Array.from(new Set(SEED_MOVEMENTS.map(m=>m.contactoProv).filter(Boolean))),
    contactosCli: Array.from(new Set(SEED_MOVEMENTS.map(m=>m.contactoCli).filter(Boolean))),
  },
  columns: DEFAULT_COLUMNS,
  history: [{ts:Date.now(),text:"App inicializada con datos de ejemplo de Enero."}],
};

const r = n => Math.round(Number(n) || 0);
const thousands = (n) => {
  const v = r(n);
  const neg = v < 0;
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-" : "") + s;
};
const fmt = n => "$\u00A0" + thousands(n);
const todayISO = () => new Date().toISOString().slice(0,10);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2,7);
const sortAlpha = (arr) => [...arr].sort((a,b)=>a.localeCompare(b,"es",{sensitivity:"base"}));

// Mes en curso segun el reloj del telefono, para abrir la app donde se esta trabajando
// en vez de arrancar siempre en enero.
const mesActual = () => MONTHS[new Date().getMonth()];

// El iPhone entrega las fotos del carrete en HEIC y a resolucion completa. La API solo acepta
// jpeg/png/gif/webp, y Vercel corta los pedidos de mas de 4,5 MB (una foto de iPhone en base64
// se acerca sola a ese limite, y la carga masiva manda varias). Por eso toda foto pasa por un
// canvas antes de subirse: sale siempre en JPEG y con el lado mayor acotado.
const MAX_LADO_FOTO = 1600;
const CALIDAD_JPEG = 0.85;

const fileToImagenJPEG = (file) => new Promise((resolve, reject)=>{
  const url = URL.createObjectURL(file);
  const img = new Image();
  const limpiar = () => URL.revokeObjectURL(url);
  img.onload = () => {
    try{
      const escala = Math.min(1, MAX_LADO_FOTO / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * escala));
      canvas.height = Math.max(1, Math.round(img.height * escala));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", CALIDAD_JPEG);
      limpiar();
      const data = dataUrl.split(",")[1];
      if(!data) throw new Error("La foto quedó vacía al convertirla.");
      resolve({media_type:"image/jpeg", data});
    }catch(err){
      limpiar();
      reject(err);
    }
  };
  img.onerror = () => {
    limpiar();
    reject(new Error("FOTO_NO_ABRE"));
  };
  img.src = url;
});

// Lee la respuesta de /api/leer-cheque. Si el servidor contesta algo que no es JSON
// (por ejemplo una pagina de error de Vercel), lo decimos en vez de romper con un error opaco.
const leerRespuestaOCR = async (resp) => {
  const texto = await resp.text();
  let json;
  try{
    json = JSON.parse(texto);
  }catch{
    throw new Error(`El servidor respondió algo inesperado (código ${resp.status}). ${texto.slice(0,120)}`);
  }
  if(json.error) throw new Error(json.error);
  return json.result;
};

// Traduce el error crudo de /api/leer-cheque a algo accionable. Sin esto el usuario solo ve
// "no pude leer la imagen" y no hay forma de saber si falta saldo, si la clave esta mal o si
// la foto no se entiende.
const mensajeDeErrorOCR = (err, fallback) => {
  const detalle = (err && err.message) || "";
  const d = detalle.toLowerCase();
  if(detalle === "FOTO_NO_ABRE"){
    return "No pude abrir esa foto. Si está guardada en iCloud, abrila primero en Fotos para que se descargue al teléfono, y probá de nuevo.";
  }
  if(d.includes("credit balance") || d.includes("billing") || d.includes("insufficient")){
    return "La cuenta de Anthropic no tiene saldo. Cargá créditos en console.anthropic.com para poder leer fotos.";
  }
  if(d.includes("authentication") || d.includes("invalid x-api-key") || d.includes("unauthorized") || d.includes("401")){
    return "La clave de la API no es válida o venció. Generá una nueva y actualizala en Vercel.";
  }
  if(d.includes("anthropic_api_key")){
    return "Falta configurar la clave de la API en el servidor.";
  }
  if(d.includes("rate") && d.includes("limit")){
    return "Demasiadas fotos seguidas. Esperá unos segundos y probá de nuevo.";
  }
  return detalle ? `${fallback}\n\nDetalle: ${detalle}` : fallback;
};

// Descarga un HTML imprimible en vez de abrir una ventana nueva (que puede quedar bloqueada
// dentro del visor de artifacts). El usuario lo abre y usa "Imprimir > Guardar como PDF".
const downloadPrintable = (filename, title, bodyHtml) => {
  const html = `<html><head><meta charset="utf-8"><title>${title}</title>
    <style>body{font-family:sans-serif;padding:20px;} h2{margin-bottom:0;} .sub{color:#666;font-size:12px;margin-bottom:4px;} .saldo{font-weight:bold;margin-bottom:14px;} table{width:100%;border-collapse:collapse;} th,td{border:1px solid #999;padding:6px 8px;font-size:12px;text-align:left;} th{background:#EAF8EF;} @media print{ body{padding:0;} }</style>
    </head><body>${bodyHtml}
    <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };<\/script>
    </body></html>`;
  const blob = new Blob([html], {type:"text/html"});
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ---------- mapeo Supabase (snake_case) <-> app (camelCase) ----------
const rowToMovement = (r) => ({
  id: r.id, mes: r.mes, fecha: r.fecha || "", proveedor: r.proveedor, contactoProv: r.contacto_prov || "",
  cliente: r.cliente, contactoCli: r.contacto_cli || "", neto: r.neto, costoPct: r.costo_pct, ventaPct: r.venta_pct,
  aPagar: r.a_pagar, perc: r.perc || 0, aCobrar: r.a_cobrar, bille: r.bille || 0, ganancia: r.ganancia,
  circuito: r.circuito || "no", montoFinal: r.monto_final || 0,
});
const movementToRow = (m) => ({
  mes: m.mes, fecha: m.fecha || "", proveedor: m.proveedor, contacto_prov: m.contactoProv || "",
  cliente: m.cliente, contacto_cli: m.contactoCli || "", neto: r(m.neto), costo_pct: Number(m.costoPct)||0, venta_pct: Number(m.ventaPct)||0,
  a_pagar: r(m.aPagar), perc: Number(m.perc)||0, a_cobrar: r(m.aCobrar), bille: r(m.bille), ganancia: r(m.ganancia),
  circuito: m.circuito === "si" ? "si" : "no", monto_final: r(m.montoFinal),
});
const rowToCheck = (r) => ({
  id: r.id, tipo: r.tipo, medioPago: r.medio_pago, fecha: r.fecha || "", fechaCobro: r.fecha_cobro || "",
  banco: r.banco || "", numero: r.numero || "", monto: r.monto, contraparte: r.contraparte || "",
  estado: r.estado, aplicadoA: r.aplicado_a,
});
const checkToRow = (c) => ({
  tipo: c.tipo, medio_pago: c.medioPago || "cheque", fecha: c.fecha || null, fecha_cobro: c.fechaCobro || null,
  banco: c.banco || "", numero: c.numero || "", monto: r(c.monto), contraparte: c.contraparte || "",
  estado: c.estado || "pendiente", aplicado_a: c.aplicadoA || null,
});
const buildEntities = (movements) => ({
  providers: Array.from(new Set(movements.map(m=>m.proveedor).filter(Boolean))),
  clients: Array.from(new Set(movements.map(m=>m.cliente).filter(Boolean))),
  contactosProv: Array.from(new Set(movements.map(m=>m.contactoProv).filter(Boolean))),
  contactosCli: Array.from(new Set(movements.map(m=>m.contactoCli).filter(Boolean))),
});

function useAppData(){
  const [data, setData] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(()=>{
    (async ()=>{
      try{
        let { data: movRows, error: e1 } = await supabase.from("movements").select("*").order("created_at", {ascending:true});
        if(e1) throw e1;

        if(!movRows || movRows.length===0){
          // primera vez que corre: sembramos el historico real
          const { data: inserted, error: e2 } = await supabase.from("movements").insert(SEED_MOVEMENTS.map(movementToRow)).select();
          if(e2) throw e2;
          movRows = inserted;
        }

        const { data: chkRows, error: e3 } = await supabase.from("checks").select("*").order("created_at", {ascending:true});
        if(e3) throw e3;

        const movements = movRows.map(rowToMovement);
        const checks = (chkRows||[]).map(rowToCheck);
        setData({
          movements, checks,
          entities: buildEntities(movements),
          columns: DEFAULT_COLUMNS,
          history: [{ts:Date.now(), text:"Conectado a la base de datos de Mi Wara."}],
        });
      }catch(e){
        console.error("Error cargando datos de Supabase:", e);
        setData({...DEFAULT_DATA, movements: [], checks: [], entities: buildEntities([])});
      }
      setLoaded(true);
    })();
  },[]);

  return [data, setData, loaded];
}

export default function LibroTela(){
  const [data, setData, loaded] = useAppData();
  const [view, setView] = useState("mov");
  const [activeMonth, setActiveMonth] = useState(mesActual);
  const [showTools, setShowTools] = useState(false);
  const [toolTab, setToolTab] = useState("export");
  const [searchQ, setSearchQ] = useState("");
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const fileInputRef = useRef(null);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [checkForm, setCheckForm] = useState(null); // object when creating/editing a check
  const [bulkForm, setBulkForm] = useState(null); // {step:'select'|'review', tipo, items:[...]}
  const bulkFileInputRef = useRef(null);
  const [cuentaTipo, setCuentaTipo] = useState("cliente");
  const [cuentaSel, setCuentaSel] = useState("");

  const searchResults = useMemo(()=>{
    if(!data || !searchQ.trim()) return {movs:[], chks:[]};
    const q = searchQ.toLowerCase();
    const movs = data.movements.filter(m=>[m.proveedor,m.cliente,m.contactoProv,m.contactoCli,m.fecha].join(" ").toLowerCase().includes(q));
    const chks = data.checks.filter(c=>[c.banco,c.numero,c.contraparte].join(" ").toLowerCase().includes(q));
    return {movs, chks};
  },[searchQ, data]);

  if(!loaded || !data){
    return <div style={{padding:40,textAlign:"center",fontFamily:"sans-serif",color:"#5C6685"}}>Cargando Mi Wara…</div>;
  }

  const log = (text) => {
    setData(d=>({...d, history:[{ts:Date.now(),text},...d.history].slice(0,150)}));
  };

  // ---------- derived helpers ----------
  const checksAppliedTo = (movId, tipo) => data.checks.filter(c=>c.aplicadoA===movId && c.tipo===tipo && c.estado==="aplicado").reduce((s,c)=>s+r(c.monto),0);
  const pendienteCobrar = (m) => r(m.aCobrar) - checksAppliedTo(m.id,"entrada");
  const pendientePagar = (m) => r(m.aPagar) - checksAppliedTo(m.id,"salida");

  const monthMovs = (mes) => data.movements.filter(m=>m.mes===mes);
  const activeMovs = activeMonth==="ANUAL" ? data.movements : monthMovs(activeMonth);

  const monthGanancia = (mes) => {
    const movs = monthMovs(mes);
    if(movs.length>0) return movs.reduce((s,m)=>s+r(m.ganancia),0);
    return SEED_GANANCIA_MES[mes] || 0;
  };
  const monthCosto = (mes) => monthMovs(mes).reduce((s,m)=>s+r(m.aPagar),0);
  const monthCobrar = (mes) => monthMovs(mes).reduce((s,m)=>s+r(m.aCobrar),0);

  const statsFor = (mes) => {
    if(mes==="ANUAL"){
      const ganancia = MONTHS.reduce((s,mm)=>s+monthGanancia(mm),0);
      const aCobrar = data.movements.reduce((s,m)=>s+pendienteCobrar(m),0);
      const aPagar = data.movements.reduce((s,m)=>s+pendientePagar(m),0);
      return {ganancia, aCobrar, aPagar};
    }
    const movs = monthMovs(mes);
    return {
      ganancia: monthGanancia(mes),
      aCobrar: movs.reduce((s,m)=>s+pendienteCobrar(m),0),
      aPagar: movs.reduce((s,m)=>s+pendientePagar(m),0),
    };
  };

  const upcomingChecks = data.checks.filter(c=>{
    if(c.estado!=="pendiente" || !c.fechaCobro) return false;
    const days = (new Date(c.fechaCobro) - new Date(todayISO())) / 86400000;
    return days <= 5;
  });

  // ---------- mutations ----------
  const addEntity = (tipo, name) => {
    if(!name) return;
    setData(d=>{
      const keyMap = {proveedor:"providers", cliente:"clients", contactoProv:"contactosProv", contactoCli:"contactosCli"};
      const key = keyMap[tipo];
      const list = d.entities[key] || [];
      if(list.includes(name)) return d;
      return {...d, entities:{...d.entities, [key]:[...list, name]}};
    });
  };

  const addMovement = async (mov) => {
    try{
      const { data: inserted, error } = await supabase.from("movements").insert(movementToRow(mov)).select().single();
      if(error) throw error;
      const newMov = rowToMovement(inserted);
      setData(d=>({...d, movements:[...d.movements, newMov]}));
      addEntity("proveedor", mov.proveedor);
      addEntity("cliente", mov.cliente);
      addEntity("contactoProv", mov.contactoProv);
      addEntity("contactoCli", mov.contactoCli);
      log(`Movimiento agregado: ${mov.proveedor} → ${mov.cliente} (${mov.mes})`);
    }catch(e){
      console.error(e);
      alert("No se pudo guardar el movimiento. Revisá tu conexión.");
    }
  };

  const MOV_COL_MAP = {mes:"mes",fecha:"fecha",proveedor:"proveedor",contactoProv:"contacto_prov",cliente:"cliente",contactoCli:"contacto_cli",neto:"neto",costoPct:"costo_pct",ventaPct:"venta_pct",aPagar:"a_pagar",perc:"perc",aCobrar:"a_cobrar",bille:"bille",ganancia:"ganancia"};

  const updateMovement = (id, field, value) => {
    setData(d=>({...d, movements: d.movements.map(m=>m.id===id ? {...m, [field]: value} : m)}));
    const col = MOV_COL_MAP[field];
    if(col){ supabase.from("movements").update({[col]: value}).eq("id", id).then(({error})=>{ if(error) console.error(error); }); }
  };

  const deleteMovement = (id) => {
    const m = data.movements.find(x=>x.id===id);
    setData(d=>({...d, movements: d.movements.filter(x=>x.id!==id)}));
    supabase.from("movements").delete().eq("id", id).then(({error})=>{ if(error) console.error(error); });
    if(m) log(`Movimiento eliminado: ${m.proveedor} → ${m.cliente}`);
  };

  const addCheck = async (chk) => {
    try{
      const row = checkToRow({...chk, estado:"pendiente", aplicadoA:null});
      const { data: inserted, error } = await supabase.from("checks").insert(row).select().single();
      if(error) throw error;
      const newChk = rowToCheck(inserted);
      setData(d=>({...d, checks:[...d.checks, newChk]}));
      log(`Cheque cargado: ${chk.tipo} $${r(chk.monto).toLocaleString("es-AR")} (${chk.banco||"s/banco"})`);
    }catch(e){
      console.error(e);
      alert("No se pudo guardar el pago. Revisá tu conexión.");
    }
  };

  const deleteCheck = (id) => {
    setData(d=>({...d, checks: d.checks.filter(c=>c.id!==id)}));
    supabase.from("checks").delete().eq("id", id).then(({error})=>{ if(error) console.error(error); });
  };

  const applyCheck = (checkId, movId) => {
    setData(d=>({...d, checks: d.checks.map(c=>c.id===checkId ? {...c, aplicadoA:movId, estado:"aplicado"} : c)}));
    supabase.from("checks").update({aplicado_a: movId, estado:"aplicado"}).eq("id", checkId).then(({error})=>{ if(error) console.error(error); });
    log("Cheque aplicado a movimiento.");
  };

  const unapplyCheck = (checkId) => {
    setData(d=>({...d, checks: d.checks.map(c=>c.id===checkId ? {...c, aplicadoA:null, estado:"pendiente"} : c)}));
    supabase.from("checks").update({aplicado_a: null, estado:"pendiente"}).eq("id", checkId).then(({error})=>{ if(error) console.error(error); });
  };

  const toggleColumn = (key) => setData(d=>({...d, columns:{...d.columns, [key]: !d.columns[key]}}));

  // ---------- OCR de cheque ----------
  const handleChequeFoto = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    setOcrBusy(true);
    try{
      const imagen = await fileToImagenJPEG(file);
      const resp = await fetch("/api/leer-cheque", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          images: [imagen],
          prompt: "Mirá esta foto de un cheque bancario argentino. Respondé SOLO con un objeto JSON (sin texto adicional, sin ```) con estas claves: banco, numero, monto (solo número entero, sin puntos ni signos), fecha (formato AAAA-MM-DD, fecha de pago/vencimiento del cheque), contraparte (nombre de quien lo libra o a la orden de quien está). Si algún dato no se ve, usá cadena vacía.",
        })
      });
      const parsed = (await leerRespuestaOCR(resp)) || {};
      setCheckForm(f=>({...f, banco: parsed.banco||f.banco, numero: parsed.numero||f.numero, monto: parsed.monto||f.monto, fechaCobro: parsed.fecha||f.fechaCobro, contraparte: parsed.contraparte||f.contraparte}));
    }catch(err){
      alert(mensajeDeErrorOCR(err, "No pude leer la imagen automáticamente. Cargá los datos del cheque a mano."));
    }
    setOcrBusy(false);
  };

  const handleBulkFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if(files.length===0) return;
    setOcrBusy(true);
    try{
      const images = await Promise.all(files.map(fileToImagenJPEG));
      const resp = await fetch("/api/leer-cheque", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          images,
          prompt: "Estas imágenes pueden contener uno o varios cheques bancarios argentinos cada una (por ejemplo varios cheques fotografiados juntos, o una foto por cheque). Identificá y extraé TODOS los cheques que puedas ver en total, sin repetir ni inventar ninguno. Respondé SOLO con un array JSON (sin texto adicional, sin ```), donde cada elemento tenga las claves: banco, numero, monto (solo número entero, sin puntos ni signos), fecha (formato AAAA-MM-DD, fecha de pago/vencimiento del cheque), contraparte (nombre de quien lo libra o a la orden de quien está). Si algún dato de un cheque no se ve, usá cadena vacía en esa clave, pero igual incluí el cheque.",
        })
      });
      const parsed = await leerRespuestaOCR(resp);
      if(!Array.isArray(parsed) || parsed.length===0){
        alert("No pude detectar ningún cheque en la foto. Probá con otra imagen o cargalos a mano.");
        setOcrBusy(false);
        return;
      }
      setBulkForm(f=>({...f, step:"review", items: parsed.map(p=>({
        banco: p.banco||"", numero: p.numero||"", monto: p.monto||"", fechaCobro: p.fecha||"", contraparte: p.contraparte||"",
      }))}));
    }catch(err){
      alert(mensajeDeErrorOCR(err, "No pude leer las imágenes automáticamente. Probá de nuevo o cargalos a mano."));
    }
    setOcrBusy(false);
  };

  const updateBulkItem = (idx, field, value) => {
    setBulkForm(f=>({...f, items: f.items.map((it,i)=> i===idx ? {...it,[field]:value} : it)}));
  };
  const removeBulkItem = (idx) => {
    setBulkForm(f=>({...f, items: f.items.filter((_,i)=>i!==idx)}));
  };
  const confirmBulkSave = () => {
    bulkForm.items.forEach(it=>{
      addCheck({tipo: bulkForm.tipo, medioPago:"cheque", fecha:todayISO(), fechaCobro: it.fechaCobro||todayISO(), banco: it.banco, numero: it.numero, monto: it.monto, contraparte: it.contraparte});
    });
    log(`Carga masiva: ${bulkForm.items.length} cheques por $${bulkForm.items.reduce((s,it)=>s+r(it.monto),0).toLocaleString("es-AR")}.`);
    setBulkForm(null);
  };

  // ---------- export ----------
  const columnList = [
    {key:"fecha", label:"Fecha"},{key:"proveedor", label:"Proveedor"},{key:"cliente", label:"Cliente"},
    {key:"neto", label:"Neto"},{key:"costoPct", label:"Costo %"},{key:"ventaPct", label:"Venta %"},
    {key:"aPagar", label:"A pagar"},{key:"perc", label:"% Percepción"},{key:"aCobrar", label:"A cobrar"},{key:"bille", label:"Billete"},{key:"ganancia", label:"Ganancia"},
  ];

  const exportRows = () => activeMovs.map(m=>{
    const row = {};
    columnList.forEach(c=>{ if(data.columns[c.key]) row[c.label] = ["neto","aPagar","aCobrar","bille","ganancia"].includes(c.key) ? r(m[c.key]) : m[c.key]; });
    return row;
  });

  const exportCSV = () => {
    const rows = exportRows();
    if(rows.length===0){ alert("No hay movimientos para exportar en esta pestaña."); return; }
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(";"), ...rows.map(row=>headers.map(h=>row[h]).join(";"))].join("\n");
    const blob = new Blob(["\uFEFF"+csv], {type:"text/csv;charset=utf-8;"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mi-wara-${activeMonth.toLowerCase()}.csv`;
    link.click();
    log(`Exportado CSV de ${activeMonth}.`);
  };

  const exportExcel = async () => {
    const rows = exportRows();
    if(rows.length===0){ alert("No hay movimientos para exportar en esta pestaña."); return; }
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, activeMonth);
    XLSX.writeFile(wb, `mi-wara-${activeMonth.toLowerCase()}.xlsx`);
    log(`Exportado Excel de ${activeMonth}.`);
  };

  const exportPDF = () => {
    const rows = exportRows();
    if(rows.length===0){ alert("No hay movimientos para exportar en esta pestaña."); return; }
    const headers = Object.keys(rows[0]);
    const body = `<h2>Mi Wara — ${activeMonth==="ANUAL"?"Todo el año":MONTH_NAMES[activeMonth]}</h2>
      <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(row=>`<tr>${headers.map(h=>`<td>${row[h]}</td>`).join("")}</tr>`).join("")}
      </tbody></table>`;
    downloadPrintable(`mi-wara-${activeMonth.toLowerCase()}.html`, `Mi Wara - ${activeMonth}`, body);
    log(`Exportado PDF de ${activeMonth}.`);
    alert("Se descargó un archivo. Abrilo y elegí 'Imprimir → Guardar como PDF' para tener el PDF final.");
  };

  const exportWhatsapp = () => {
    const s = statsFor(activeMonth);
    const texto = `*Mi Wara — ${activeMonth==="ANUAL"?"Resumen anual":MONTH_NAMES[activeMonth]}*\nGanancia: ${fmt(s.ganancia)}\nA cobrar pendiente: ${fmt(s.aCobrar)}\nA pagar pendiente: ${fmt(s.aPagar)}\nMovimientos: ${activeMovs.length}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
    log("Resumen compartido por WhatsApp.");
  };

  const backupJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mi-wara-backup-${todayISO()}.json`;
    link.click();
    log("Backup completo descargado.");
  };

  // ---------- ranking / cuentas ----------
  const rankBy = (field) => {
    const totals = {};
    data.movements.forEach(m=>{ totals[m[field]] = (totals[m[field]]||0) + r(m.neto); });
    return Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,5);
  };

  const entityMovs = (tipo, name) => data.movements.filter(m => (tipo==="cliente" ? m.cliente : m.proveedor) === name);
  const entitySaldo = (tipo, name) => entityMovs(tipo,name).reduce((s,m)=> s + (tipo==="cliente" ? pendienteCobrar(m) : pendientePagar(m)), 0);

  return (
    <div style={{background:PAPER, minHeight:"100vh", fontFamily:"Inter, sans-serif", color:INK, paddingBottom:"calc(88px + env(safe-area-inset-bottom, 0px))"}}>
      <GlobalStyle/>

      {/* HEADER */}
      <div style={{padding:"18px 16px 10px", display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <div style={{display:"flex", alignItems:"center", gap:8}}>
          <img src="/logo.png" alt="Mi Wara" style={{width:34,height:34,borderRadius:8,display:"block"}}/>
          <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:20}}>Mi Wara</div>
        </div>
        <div style={{display:"flex", gap:8}}>
          <button className="iconbtn" onClick={()=>{setShowTools(true); setToolTab("search");}}><Search size={17}/></button>
          <button className="iconbtn" onClick={()=>{setShowTools(true); setToolTab("export");}}><Settings size={17}/></button>
        </div>
      </div>

      {/* ALERTS */}
      {upcomingChecks.length>0 && !dismissedAlert && (
        <div className="alert-banner" onClick={()=>setView("cheques")}>
          <AlertTriangle size={16}/>
          <span>{upcomingChecks.length} cheque{upcomingChecks.length>1?"s":""} por vencer o vencido{upcomingChecks.length>1?"s":""} — {fmt(upcomingChecks.reduce((s,c)=>s+r(c.monto),0))}</span>
          <X size={15} onClick={(e)=>{e.stopPropagation(); setDismissedAlert(true);}}/>
        </div>
      )}

      {/* VIEWS */}
      {view==="mov" && (
        <MovimientosView
          activeMonth={activeMonth} setActiveMonth={setActiveMonth}
          movs={activeMovs} allMovements={data.movements} stats={statsFor(activeMonth)} columns={data.columns}
          entities={data.entities} pendienteCobrar={pendienteCobrar} pendientePagar={pendientePagar}
          updateMovement={updateMovement} deleteMovement={deleteMovement} addMovement={addMovement}
        />
      )}
      {view==="cheques" && (
        <ChequesView
          checks={data.checks} movements={data.movements}
          onNew={()=>setCheckForm({tipo:"entrada",medioPago:"cheque",fecha:todayISO(),fechaCobro:todayISO(),banco:"",numero:"",monto:"",contraparte:""})}
          onBulkNew={()=>setBulkForm({step:"select", tipo:"entrada", items:[]})}
          onDelete={deleteCheck} onApply={applyCheck} onUnapply={unapplyCheck}
          pendienteCobrar={pendienteCobrar} pendientePagar={pendientePagar}
        />
      )}
      {view==="cuentas" && (
        <CuentasView
          tipo={cuentaTipo} setTipo={setCuentaTipo} sel={cuentaSel} setSel={setCuentaSel}
          entities={data.entities} entityMovs={entityMovs} entitySaldo={entitySaldo}
          pendienteCobrar={pendienteCobrar} pendientePagar={pendientePagar} rankBy={rankBy}
          movements={data.movements} statsFor={statsFor}
        />
      )}
      {view==="resumen" && (
        <ResumenView monthGanancia={monthGanancia} monthCosto={monthCosto} monthCobrar={monthCobrar} />
      )}

      {/* BOTTOM NAV */}
      <div className="bottomnav">
        <NavBtn active={view==="mov"} onClick={()=>setView("mov")} label="Movim." emoji="📒"/>
        <NavBtn active={view==="cheques"} onClick={()=>setView("cheques")} label="Pagos" emoji="💳"/>
        <NavBtn active={view==="cuentas"} onClick={()=>setView("cuentas")} label="Cuentas" emoji="👤"/>
        <NavBtn active={view==="resumen"} onClick={()=>setView("resumen")} label="Resumen" emoji="📊"/>
      </div>

      {/* TOOLS PANEL */}
      {showTools && (
        <div className="overlay" onClick={()=>setShowTools(false)}>
          <div className="panel" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
              <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:17}}>Herramientas</div>
              <X size={20} onClick={()=>setShowTools(false)}/>
            </div>
            <div style={{display:"flex", gap:6, marginBottom:14, flexWrap:"wrap"}}>
              {[["search","Buscar"],["export","Exportar"],["columns","Columnas"],["history","Historial"]].map(([k,l])=>(
                <button key={k} className={"pill"+(toolTab===k?" pill-on":"")} onClick={()=>setToolTab(k)}>{l}</button>
              ))}
            </div>

            {toolTab==="search" && (
              <div>
                <input className="input" placeholder="Buscar cliente, proveedor, factura, cheque…" value={searchQ} onChange={e=>setSearchQ(e.target.value)} />
                <div style={{marginTop:10, maxHeight:280, overflowY:"auto"}}>
                  {searchQ && searchResults.movs?.length===0 && searchResults.chks?.length===0 && <div className="muted">Sin resultados.</div>}
                  {searchResults.movs?.map(m=>(
                    <div key={m.id} className="result-row">📒 {m.proveedor} → {m.cliente} <span className="muted">({m.mes}) {fmt(m.aCobrar)}</span></div>
                  ))}
                  {searchResults.chks?.map(c=>(
                    <div key={c.id} className="result-row">🧾 {c.tipo==="entrada"?"Entrada":"Salida"} {c.banco} #{c.numero} <span className="muted">{fmt(c.monto)}</span></div>
                  ))}
                </div>
              </div>
            )}

            {toolTab==="export" && (
              <div>
                <div className="muted" style={{marginBottom:8}}>Exporta la pestaña activa: <b>{activeMonth}</b></div>
                <div className="col-chips">
                  {columnList.map(c=>(
                    <span key={c.key} className={"chip"+(data.columns[c.key]?" chip-on":"")} onClick={()=>toggleColumn(c.key)}>{c.label}</span>
                  ))}
                </div>
                <div style={{display:"flex", gap:8, marginTop:10, flexWrap:"wrap"}}>
                  <button className="exp-btn" onClick={exportPDF}>PDF</button>
                  <button className="exp-btn" onClick={exportExcel}>Excel</button>
                  <button className="exp-btn" onClick={exportCSV}>CSV</button>
                  <button className="exp-btn wa" onClick={exportWhatsapp}><MessageCircle size={14}/> WhatsApp</button>
                </div>
                <div style={{marginTop:14, borderTop:`1px dashed ${LINE}`, paddingTop:10}}>
                  <button className="exp-btn full" onClick={backupJSON}><Download size={14}/> Descargar backup completo (JSON)</button>
                  <div className="muted" style={{marginTop:6, fontSize:10.5}}>Además, todo se guarda automáticamente en este dispositivo cada vez que cargás algo.</div>
                </div>
              </div>
            )}

            {toolTab==="columns" && (
              <div>
                <div className="muted" style={{marginBottom:8}}>Elegí qué columnas mostrar en la tabla de movimientos.</div>
                <div className="col-chips">
                  {columnList.map(c=>(
                    <span key={c.key} className={"chip"+(data.columns[c.key]?" chip-on":"")} onClick={()=>toggleColumn(c.key)}>{c.label}</span>
                  ))}
                </div>
              </div>
            )}

            {toolTab==="history" && (
              <div style={{maxHeight:320, overflowY:"auto"}}>
                {data.history.length===0 && <div className="muted">Todavía no hay actividad registrada.</div>}
                {data.history.map((h,i)=>(
                  <div key={i} className="hist-row">
                    <div className="hist-time">{new Date(h.ts).toLocaleString("es-AR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}</div>
                    <div>{h.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PAGO FORM MODAL */}
      {checkForm && (
        <div className="overlay" onClick={()=>setCheckForm(null)}>
          <div className="panel" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:17}}>Nuevo pago</div>
              <X size={20} onClick={()=>setCheckForm(null)}/>
            </div>

            <div className="field-row">
              <div className="field">
                <label>Tipo</label>
                <select className="input" value={checkForm.tipo} onChange={e=>setCheckForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="entrada">Entrada (cliente me paga)</option>
                  <option value="salida">Salida (yo pago a proveedor)</option>
                </select>
              </div>
              <div className="field">
                <label>Medio de pago</label>
                <select className="input" value={checkForm.medioPago||"cheque"} onChange={e=>setCheckForm(f=>({...f,medioPago:e.target.value}))}>
                  <option value="cheque">Cheque</option>
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
            </div>

            {checkForm.medioPago!=="efectivo" && (
              <>
                {checkForm.medioPago==="cheque" && (
                  <>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleChequeFoto}/>
                    <button className="exp-btn full" style={{marginBottom:12}} onClick={()=>fileInputRef.current.click()} disabled={ocrBusy}>
                      <Camera size={15}/> {ocrBusy ? "Leyendo cheque…" : "Sacar foto y leer datos"}
                    </button>
                  </>
                )}
                <div className="field-row">
                  <div className="field">
                    <label>{checkForm.medioPago==="cheque" ? "Banco" : "Banco/entidad"}</label>
                    <input className="input" value={checkForm.banco} onChange={e=>setCheckForm(f=>({...f,banco:e.target.value}))}/>
                  </div>
                  <div className="field">
                    <label>{checkForm.medioPago==="cheque" ? "Número" : "N° operación"}</label>
                    <input className="input" value={checkForm.numero} onChange={e=>setCheckForm(f=>({...f,numero:e.target.value}))}/>
                  </div>
                </div>
              </>
            )}

            <div className="field-row">
              <div className="field">
                <label>Monto</label>
                <input className="input" type="number" value={checkForm.monto} onChange={e=>setCheckForm(f=>({...f,monto:e.target.value}))}/>
              </div>
              <div className="field">
                <label>Fecha de pago</label>
                <input className="input" type="date" value={checkForm.fechaCobro} onChange={e=>setCheckForm(f=>({...f,fechaCobro:e.target.value}))}/>
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>{checkForm.tipo==="entrada" ? "Cliente" : "Proveedor"}</label>
                <Combobox
                  value={checkForm.contraparte}
                  onChange={v=>setCheckForm(f=>({...f,contraparte:v}))}
                  options={checkForm.tipo==="entrada" ? data.entities.clients : data.entities.providers}
                  placeholder="Empezá a tipear…"
                />
              </div>
            </div>

            <button className="exp-btn full" style={{marginTop:10, background:INK, color:PAPER_CARD}} onClick={()=>{
              if(!checkForm.monto){ alert("Cargá el monto del pago."); return; }
              addCheck(checkForm);
              setCheckForm(null);
            }}>Guardar pago</button>
          </div>
        </div>
      )}

      {/* CARGA MASIVA DE CHEQUES POR FOTO */}
      {bulkForm && (
        <div className="overlay" onClick={()=>setBulkForm(null)}>
          <div className="panel" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:17}}>Cargar varios cheques</div>
              <X size={20} onClick={()=>setBulkForm(null)}/>
            </div>

            {bulkForm.step==="select" && (
              <div>
                <label>¿Quién te los dio a vos, o a quién se los diste?</label>
                <select className="input" style={{marginBottom:14}} value={bulkForm.tipo} onChange={e=>setBulkForm(f=>({...f,tipo:e.target.value}))}>
                  <option value="entrada">Me los dieron a mí (cliente me paga)</option>
                  <option value="salida">Yo se los di a un proveedor</option>
                </select>
                <div className="muted" style={{marginBottom:12}}>Sacá una foto con varios cheques juntos, o elegí varias fotos (una por cheque). Se leen y suman todos solos.</div>
                <input ref={bulkFileInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleBulkFiles}/>
                <button className="exp-btn full" onClick={()=>bulkFileInputRef.current.click()} disabled={ocrBusy}>
                  <Camera size={15}/> {ocrBusy ? "Leyendo cheques…" : "Sacar o elegir fotos"}
                </button>
              </div>
            )}

            {bulkForm.step==="review" && (
              <div>
                <div className="muted" style={{marginBottom:10}}>
                  Encontré {bulkForm.items.length} cheque{bulkForm.items.length!==1?"s":""} — revisá los datos antes de guardar.
                </div>
                {bulkForm.items.map((it,idx)=>(
                  <div key={idx} className="check-card">
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                      <b style={{fontSize:12}}>Cheque #{idx+1}</b>
                      <X size={15} style={{cursor:"pointer", color:RED}} onClick={()=>removeBulkItem(idx)}/>
                    </div>
                    <div className="field-row">
                      <div className="field"><label>Banco</label>
                        <input className="input" value={it.banco} onChange={e=>updateBulkItem(idx,"banco",e.target.value)}/>
                      </div>
                      <div className="field"><label>Número</label>
                        <input className="input" value={it.numero} onChange={e=>updateBulkItem(idx,"numero",e.target.value)}/>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field"><label>Monto</label>
                        <input className="input" type="number" value={it.monto} onChange={e=>updateBulkItem(idx,"monto",e.target.value)}/>
                      </div>
                      <div className="field"><label>Fecha de pago</label>
                        <input className="input" type="date" value={it.fechaCobro} onChange={e=>updateBulkItem(idx,"fechaCobro",e.target.value)}/>
                      </div>
                    </div>
                    <div className="field-row">
                      <div className="field"><label>{bulkForm.tipo==="entrada" ? "Cliente" : "Proveedor"}</label>
                        <Combobox
                          value={it.contraparte}
                          onChange={v=>updateBulkItem(idx,"contraparte",v)}
                          options={bulkForm.tipo==="entrada" ? data.entities.clients : data.entities.providers}
                          placeholder="Empezá a tipear…"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="oneline-total">
                  <b>Total {bulkForm.items.length} cheque{bulkForm.items.length!==1?"s":""}:</b> {fmt(bulkForm.items.reduce((s,it)=>s+r(it.monto),0))}
                </div>
                <button className="exp-btn full" style={{marginTop:10, background:INK, color:PAPER_CARD}} onClick={confirmBulkSave} disabled={bulkForm.items.length===0}>
                  Guardar {bulkForm.items.length} cheque{bulkForm.items.length!==1?"s":""}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ SUBCOMPONENTS ============
function MoneyInput({value, onChange, placeholder}){
  const display = (value===""||value===null||value===undefined) ? "" : fmt(r(value));
  return (
    <input
      className="input"
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={e=>{
        const raw = e.target.value.replace(/[^0-9-]/g,"");
        onChange(raw);
      }}
    />
  );
}



function Combobox({value, onChange, options, placeholder}){
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const v = (value||"").toLowerCase();
  const sortedOptions = sortAlpha(options);
  const filtered = (v ? sortedOptions.filter(o=>o.toLowerCase().includes(v)) : sortedOptions).slice(0,8);

  useEffect(()=>{
    if(!open) return;
    const handler = (e) => {
      if(wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  return (
    <div style={{position:"relative"}} ref={wrapRef}>
      <input
        className="input"
        value={value||""}
        placeholder={placeholder}
        onChange={e=>{ onChange(e.target.value); setOpen(true); }}
        onFocus={()=>setOpen(true)}
      />
      {open && filtered.length>0 && (
        <div className="combo-list">
          {filtered.map(o=>(
            <div key={o} className="combo-item" onClick={()=>{ onChange(o); setOpen(false); }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function NavBtn({active, onClick, label, emoji}){
  return (
    <button className={"navbtn"+(active?" navbtn-on":"")} onClick={onClick}>
      <span style={{fontSize:17}}>{emoji}</span>
      <span style={{fontSize:10}}>{label}</span>
    </button>
  );
}

function MovimientosView({activeMonth, setActiveMonth, movs, allMovements, stats, columns, entities, pendienteCobrar, pendientePagar, updateMovement, deleteMovement, addMovement}){
  const [form, setForm] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [anualFilter, setAnualFilter] = useState("TODOS");
  const [showExport, setShowExport] = useState(false);
  const [bulkInvForm, setBulkInvForm] = useState(null); // {items:[...]}
  const [invOcrBusy, setInvOcrBusy] = useState(false);
  const invFileInputRef = useRef(null);
  const tabsRef = useRef(null);

  // Los 13 botones de mes no entran en el ancho de un telefono. Al abrir, centramos el mes
  // activo en la fila para que no quede fuera de pantalla. Solo movemos el scroll horizontal
  // de la fila, no el de la pagina.
  useEffect(()=>{
    const fila = tabsRef.current;
    const activa = fila && fila.querySelector(".tab.active");
    if(!fila || !activa) return;
    fila.scrollLeft = activa.offsetLeft - (fila.clientWidth - activa.offsetWidth) / 2;
  },[]);
  const [expTipo, setExpTipo] = useState("cliente");
  const [expSel, setExpSel] = useState("");
  const [expMonth, setExpMonth] = useState(activeMonth==="ANUAL" ? "TODOS" : activeMonth);
  const CLIENT_DEFAULT_COLS = {mes:true, fecha:true, contraparte:true, neto:true, costoPct:false, ventaPct:true, aPagar:false, perc:true, aCobrar:true, pendiente:false, ganancia:false};
  const PROVIDER_DEFAULT_COLS = {mes:true, fecha:true, contraparte:false, neto:true, costoPct:true, ventaPct:false, aPagar:true, perc:false, aCobrar:false, pendiente:false, ganancia:false};
  const [expCols, setExpCols] = useState(CLIENT_DEFAULT_COLS);
  const toggleExpCol = (k) => setExpCols(c=>({...c, [k]: !c[k]}));
  const presetClienteCols = () => setExpCols({mes:true, fecha:false, contraparte:true, neto:true, costoPct:false, ventaPct:true, aPagar:false, perc:true, aCobrar:true, ganancia:false, pendiente:false});
  const chooseExpTipo = (t) => {
    setExpTipo(t); setExpSel("");
    setExpCols(t==="cliente" ? CLIENT_DEFAULT_COLS : PROVIDER_DEFAULT_COLS);
  };

  const openForm = () => setForm({
    mes: activeMonth==="ANUAL" ? mesActual() : activeMonth, fecha:"", proveedor:"", contactoProv:"",
    cliente:"", contactoCli:"", circuito:"no", montoFinal:"", neto:"", costoPct:"", ventaPct:"", aPagar:"", perc:"", aCobrar:"", bille:"", ganancia:"",
  });

  const IVA = 1.21;
  const ddmmyyToISO = (s) => {
    if(!s) return "";
    const m = (s+"").match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if(!m) return "";
    let [, d, mo, y] = m;
    if(y.length===2) y = "20"+y;
    return `${y}-${mo.padStart(2,"0")}-${d.padStart(2,"0")}`;
  };
  const isoToDDMMYY = (iso) => {
    if(!iso) return "";
    const [y,mo,d] = iso.split("-");
    return `${d}/${mo}/${y.slice(2)}`;
  };

  // Recalcula A pagar / A cobrar / Ganancia a partir de Neto, Costo%, Venta%, Percepción% y Billete.
  const calcDerived = (f) => {
    const neto = r(f.neto);
    const costoPct = parseFloat((f.costoPct+"").replace(",",".")) || 0;
    const ventaPct = parseFloat((f.ventaPct+"").replace(",",".")) || 0;
    const perc = parseFloat((f.perc+"").replace(",",".")) || 0;
    const bille = r(f.bille);
    const aPagar = Math.round(neto * (costoPct + perc) / 100);
    const aCobrar = Math.round(neto * (ventaPct + perc) / 100);
    const ganancia = aCobrar - aPagar + bille;
    return {...f, aPagar, aCobrar, ganancia};
  };

  // Si ya cargaste este proveedor o cliente antes, autocompleta la empresa/facturación
  // habitual de esa contraparte con el último movimiento que coincida.
  const suggestFromHistory = (f, changedField, value) => {
    if(!value) return f;
    const match = [...allMovements].reverse().find(m => m[changedField] === value);
    if(!match) return f;
    const next = {...f};
    if(changedField === "proveedor" && !next.contactoProv) next.contactoProv = match.contactoProv || "";
    if(changedField === "cliente" && !next.contactoCli) next.contactoCli = match.contactoCli || "";
    return next;
  };

  // Circuito (factura con IVA): si cargo el monto final, calculo el neto (sin IVA);
  // si cargo el neto, calculo el monto final. Los % siempre se aplican sobre el neto.
  const setNetoFromFinal = (f, montoFinalRaw) => {
    const montoFinal = r(montoFinalRaw);
    const neto = Math.round(montoFinal / IVA);
    return calcDerived({...f, montoFinal: montoFinalRaw, neto});
  };
  const setFinalFromNeto = (f, netoRaw) => {
    const neto = r(netoRaw);
    const montoFinal = f.circuito==="si" ? Math.round(neto*IVA) : f.montoFinal;
    return calcDerived({...f, neto: netoRaw, montoFinal});
  };

  // Busca si el nombre de empresa leído en una factura coincide con una "Empresa" (proveedor)
  // o un "Facturado a" (cliente) ya usados antes, y trae los datos habituales de esa contraparte.
  const matchEmpresa = (nameRaw) => {
    if(!nameRaw) return null;
    const norm = nameRaw.trim().toUpperCase();
    if(!norm) return null;
    const sameOrIncludes = (a) => { const A = (a||"").trim().toUpperCase(); return A && (A===norm || norm.includes(A) || A.includes(norm)); };
    let m = [...allMovements].reverse().find(mv => sameOrIncludes(mv.contactoProv));
    if(m) return {tipo:"proveedor", proveedor:m.proveedor, contactoProv:m.contactoProv, costoPct:m.costoPct, perc:m.perc};
    m = [...allMovements].reverse().find(mv => sameOrIncludes(mv.contactoCli));
    if(m) return {tipo:"cliente", cliente:m.cliente, contactoCli:m.contactoCli, ventaPct:m.ventaPct, perc:m.perc};
    return null;
  };

  const handleBulkInvoiceFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    if(files.length===0) return;
    setInvOcrBusy(true);
    try{
      const images = await Promise.all(files.map(fileToImagenJPEG));
      const resp = await fetch("/api/leer-cheque", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          images,
          prompt: "Estas imágenes son fotos de facturas (una o varias facturas distintas, puede haber una por imagen). Por cada factura que identifiques, extraé: empresa (el nombre de la empresa que figura en la factura, la razón social principal), fecha (formato AAAA-MM-DD), neto (el importe neto o subtotal SIN IVA si figura explícitamente, si no dejalo vacío), total (el importe TOTAL final, con IVA incluido, si figura), numero (número de factura si se ve). Respondé SOLO un array JSON, un objeto por factura, sin texto adicional y sin ```. Si algún dato no se ve, usá cadena vacía en esa clave, pero igual incluí la factura.",
        })
      });
      const parsed = await leerRespuestaOCR(resp);
      if(!Array.isArray(parsed) || parsed.length===0){
        alert("No pude detectar ninguna factura en la foto. Probá con otra imagen o cargalas a mano.");
        setInvOcrBusy(false);
        return;
      }
      const items = parsed.map(p=>{
        const match = matchEmpresa(p.empresa);
        const total = p.total ? r(p.total) : "";
        const neto = p.neto ? r(p.neto) : (total ? Math.round(total/IVA) : "");
        return {
          empresaDetectada: p.empresa || "",
          numero: p.numero || "",
          mes: activeMonth==="ANUAL" ? mesActual() : activeMonth,
          fecha: p.fecha ? isoToDDMMYY(p.fecha) : "",
          proveedor: match && match.tipo==="proveedor" ? match.proveedor : "",
          contactoProv: match && match.tipo==="proveedor" ? match.contactoProv : (match ? "" : (p.empresa||"")),
          cliente: match && match.tipo==="cliente" ? match.cliente : "",
          contactoCli: match && match.tipo==="cliente" ? match.contactoCli : "",
          neto, montoFinal: total,
          costoPct: match && match.tipo==="proveedor" ? (match.costoPct||"") : "",
          ventaPct: match && match.tipo==="cliente" ? (match.ventaPct||"") : "",
          perc: match ? (match.perc||"") : "",
          bille: "",
        };
      });
      setBulkInvForm({items});
    }catch(err){
      alert(mensajeDeErrorOCR(err, "No pude leer las facturas automáticamente. Probá de nuevo o cargalas a mano."));
    }
    setInvOcrBusy(false);
  };

  const updateBulkInvItem = (idx, patch) => {
    setBulkInvForm(f=>({...f, items: f.items.map((it,i)=> i===idx ? {...it, ...patch} : it)}));
  };
  const removeBulkInvItem = (idx) => {
    setBulkInvForm(f=>({...f, items: f.items.filter((_,i)=>i!==idx)}));
  };
  const confirmBulkInvSave = () => {
    const invalid = bulkInvForm.items.some(it=>!it.proveedor || !it.cliente);
    if(invalid){ alert("Completá proveedor y cliente en todas las facturas antes de guardar."); return; }
    bulkInvForm.items.forEach(it=>{
      const neto = r(it.neto), costoPct = parseFloat((it.costoPct+"").replace(",","."))||0, ventaPct = parseFloat((it.ventaPct+"").replace(",","."))||0, perc = parseFloat((it.perc+"").replace(",","."))||0, bille = r(it.bille);
      const aPagar = Math.round(neto*(costoPct+perc)/100);
      const aCobrar = Math.round(neto*(ventaPct+perc)/100);
      const ganancia = aCobrar - aPagar + bille;
      addMovement({
        mes: it.mes, fecha: it.fecha, proveedor: it.proveedor, contactoProv: it.contactoProv,
        cliente: it.cliente, contactoCli: it.contactoCli, neto, costoPct, ventaPct, aPagar, perc, aCobrar, bille, ganancia,
      });
    });
    setBulkInvForm(null);
  };

  const columnList = [
    {key:"fecha", label:"Fecha", w:70},{key:"proveedor", label:"Proveedor", w:110},{key:"cliente", label:"Cliente", w:110},
    {key:"neto", label:"Neto", w:100},{key:"costoPct", label:"Costo%", w:60},{key:"ventaPct", label:"Venta%", w:60},
    {key:"aPagar", label:"A pagar", w:95},{key:"perc", label:"Perc%", w:60},{key:"aCobrar", label:"A cobrar", w:95},{key:"bille", label:"Billete", w:85},{key:"ganancia", label:"Ganancia", w:95},
  ].filter(c=>columns[c.key]);

  const displayedMovs = (activeMonth==="ANUAL" && anualFilter!=="TODOS") ? movs.filter(m=>m.mes===anualFilter) : movs;
  const displayedStats = (activeMonth==="ANUAL" && anualFilter!=="TODOS") ? {
    ganancia: displayedMovs.reduce((s,m)=>s+r(m.ganancia),0),
    aCobrar: displayedMovs.reduce((s,m)=>s+pendienteCobrar(m),0),
    aPagar: displayedMovs.reduce((s,m)=>s+pendientePagar(m),0),
  } : stats;

  const MONEY_KEYS = ["neto","aPagar","aCobrar","bille","ganancia"];
  const PCT_KEYS = ["costoPct","ventaPct","perc"];

  const expNames = sortAlpha(expTipo==="cliente" ? entities.clients : entities.providers);

  const exportEntityFromMonth = () => {
    if(!expSel){ alert("Elegí un cliente o proveedor."); return; }
    let scope = expMonth==="TODOS" ? allMovements : allMovements.filter(m=>m.mes===expMonth);
    scope = scope.filter(m => (expTipo==="cliente" ? m.cliente : m.proveedor) === expSel);
    if(scope.length===0){ alert("Ese cliente/proveedor no tiene movimientos en ese período."); return; }
    const cols = ENTITY_PDF_COLUMNS.filter(c=>expCols[c.key]);
    if(cols.length===0){ alert("Elegí al menos una columna."); return; }
    const rows = scope.map(m=>{
      const row = {};
      cols.forEach(c=>{
        if(c.key==="contraparte") row[c.label] = expTipo==="cliente" ? `${m.proveedor} ${m.contactoProv||""}`.trim() : `${m.cliente} ${m.contactoCli||""}`.trim();
        else if(c.key==="pendiente") row[c.label] = fmt(expTipo==="cliente" ? pendienteCobrar(m) : pendientePagar(m));
        else if(["neto","aPagar","aCobrar","ganancia"].includes(c.key)) row[c.label] = fmt(m[c.key]);
        else if(c.key==="costoPct" || c.key==="ventaPct" || c.key==="perc") row[c.label] = m[c.key] + "%";
        else row[c.label] = m[c.key] || "—";
      });
      return row;
    });
    const headers = Object.keys(rows[0]);
    const periodo = expMonth==="TODOS" ? "Todo el año" : MONTH_NAMES[expMonth];
    const body = `<h2>${expSel}</h2><div class="sub">Período: ${periodo}</div>
      <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(row=>`<tr>${headers.map(h=>`<td>${row[h]}</td>`).join("")}</tr>`).join("")}
      </tbody></table>`;
    downloadPrintable(`${expSel.replace(/[^a-z0-9]/gi,"-")}.html`, expSel, body);
    setShowExport(false);
    alert("Se descargó un archivo. Abrilo y elegí 'Imprimir → Guardar como PDF' para tener el PDF final.");
  };

  return (
    <div>
      <div className="tabs" ref={tabsRef}>
        {[...MONTHS, "ANUAL"].map(m=>(
          <button key={m} className={"tab"+(m==="ANUAL"?" anual":"")+(activeMonth===m?" active":"")} onClick={()=>setActiveMonth(m)}>{m}</button>
        ))}
      </div>

      <div className="sheet">
        <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, gap:8}}>
          <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:16}}>{activeMonth==="ANUAL" ? "Todo el año" : MONTH_NAMES[activeMonth]}</div>
          {activeMonth==="ANUAL" && (
            <select className="input" style={{width:"auto", padding:"5px 6px", fontSize:11, marginTop:0}} value={anualFilter} onChange={e=>setAnualFilter(e.target.value)}>
              <option value="TODOS">Todos los meses</option>
              {MONTHS.map(m=><option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
            </select>
          )}
        </div>

        <button className="exp-btn full" style={{marginBottom:8, background:INK, color:PAPER_CARD}} onClick={openForm}><Plus size={15}/> Nuevo movimiento</button>

        <input ref={invFileInputRef} type="file" accept="image/*" multiple style={{display:"none"}} onChange={handleBulkInvoiceFiles}/>
        <button className="exp-btn full" style={{marginBottom:12}} onClick={()=>invFileInputRef.current.click()} disabled={invOcrBusy}>
          <Camera size={15}/> {invOcrBusy ? "Leyendo facturas…" : "Cargar varias facturas (foto)"}
        </button>

        <div className="stats">
          <div className="stat debo"><div className="lbl">Debo</div><div className="val">{fmt(displayedStats.aPagar)}</div></div>
          <div className="stat cobrar"><div className="lbl">Me deben</div><div className="val">{fmt(displayedStats.aCobrar)}</div></div>
          <div className="stat gan"><div className="lbl">Ganancia</div><div className="val">{fmt(displayedStats.ganancia)}</div></div>
        </div>

        <button className="exp-btn full" style={{marginBottom:14}} onClick={()=>setShowExport(true)}><Download size={14}/> Exportar cliente/proveedor de {activeMonth==="ANUAL" ? "un período" : MONTH_NAMES[activeMonth]}</button>

        {displayedMovs.length===0 ? (
          <div className="empty"><b>Sin movimientos cargados</b>Tocá “+ Nuevo movimiento” para cargar el primero.</div>
        ) : (
          <div style={{overflowX:"auto"}}>
            <table>
              <thead><tr>
                {columnList.map(c=><th key={c.key} style={{minWidth:c.w}}>{c.label}</th>)}
                <th style={{minWidth:30}}></th>
              </tr></thead>
              <tbody>
                {displayedMovs.map(m=>{
                  const debe = pendienteCobrar(m) > 0;
                  return (
                    <tr key={m.id} className={debe?"debt":""}>
                      {columnList.map(c=>{
                        const isMoney = MONEY_KEYS.includes(c.key);
                        const isPct = PCT_KEYS.includes(c.key);
                        const cellKey = `${m.id}:${c.key}`;
                        const editing = editingKey === cellKey;
                        let displayValue;
                        if(editing){ displayValue = m[c.key] ?? ""; }
                        else if(isMoney){ displayValue = fmt(m[c.key]); }
                        else if(isPct){ displayValue = (m[c.key] ?? 0) + "%"; }
                        else { displayValue = m[c.key] ?? ""; }
                        return (
                          <td key={c.key}>
                            <input
                              className="cellinput"
                              value={displayValue}
                              inputMode={(isMoney||isPct) ? "decimal" : "text"}
                              onFocus={()=>setEditingKey(cellKey)}
                              onChange={e=>{
                                const raw = (isMoney||isPct) ? e.target.value.replace(/[^0-9.,-]/g,"") : e.target.value;
                                updateMovement(m.id, c.key, raw);
                              }}
                              onBlur={e=>{
                                setEditingKey(null);
                                if(isMoney) updateMovement(m.id, c.key, r(e.target.value));
                                else if(isPct) updateMovement(m.id, c.key, parseFloat((e.target.value+"").replace(",", ".")) || 0);
                              }}
                            />
                            {c.key==="cliente" && debe && <span className="tag-debe">DEBE</span>}
                          </td>
                        );
                      })}
                      <td><Trash2 size={14} style={{cursor:"pointer", color:RED}} onClick={()=>{ if(confirm("¿Eliminar este movimiento?")) deleteMovement(m.id); }}/></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {form && (
        <div className="overlay" onClick={()=>setForm(null)}>
          <div className="panel" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:17}}>Nuevo movimiento</div>
              <X size={20} onClick={()=>setForm(null)}/>
            </div>
            <form onSubmit={e=>{
              e.preventDefault();
              if(!form.proveedor || !form.cliente){ alert("Cargá al menos proveedor y cliente."); return; }
              const clean = {...form};
              MONEY_KEYS.concat(["montoFinal"]).forEach(k=>{ clean[k] = r(clean[k]); });
              // los % se guardan con decimales (6,5 % no es lo mismo que 7 %)
              PCT_KEYS.forEach(k=>{ clean[k] = parseFloat((clean[k]+"").replace(",",".")) || 0; });
              addMovement(clean);
              setForm(null);
            }}>
            <div className="field-row">
              <div className="field"><label>Mes</label>
                <select className="input" value={form.mes} onChange={e=>setForm(f=>({...f,mes:e.target.value}))}>
                  {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="field"><label>Fecha</label>
                <div style={{display:"flex", gap:6}}>
                  <input className="input" type="date" value={ddmmyyToISO(form.fecha)} onChange={e=>setForm(f=>({...f,fecha:isoToDDMMYY(e.target.value)}))}/>
                  <button type="button" className="pill" style={{whiteSpace:"nowrap"}} onClick={()=>setForm(f=>({...f,fecha:isoToDDMMYY(todayISO())}))}>Hoy</button>
                </div>
              </div>
            </div>
            <div className="field-row">
              <div className="field"><label>Proveedor</label>
                <Combobox value={form.proveedor} onChange={v=>setForm(f=>suggestFromHistory({...f,proveedor:v}, "proveedor", v))} options={entities.providers} placeholder="Empezá a tipear…"/>
              </div>
              <div className="field"><label>Empresa</label>
                <Combobox value={form.contactoProv} onChange={v=>setForm(f=>({...f,contactoProv:v}))} options={entities.contactosProv||[]} placeholder="Empezá a tipear…"/>
              </div>
            </div>
            <div className="field-row">
              <div className="field"><label>Cliente</label>
                <Combobox value={form.cliente} onChange={v=>setForm(f=>suggestFromHistory({...f,cliente:v}, "cliente", v))} options={entities.clients} placeholder="Empezá a tipear…"/>
              </div>
              <div className="field"><label>Facturado a</label>
                <Combobox value={form.contactoCli} onChange={v=>setForm(f=>({...f,contactoCli:v}))} options={entities.contactosCli||[]} placeholder="Empezá a tipear…"/>
              </div>
            </div>

            <div className="field" style={{marginBottom:8}}>
              <label>Circuito (factura con IVA)</label>
              <div className="col-chips">
                <span className={"chip"+(form.circuito==="no"?" chip-on":"")} onClick={()=>setForm(f=>({...f,circuito:"no"}))}>No</span>
                <span className={"chip"+(form.circuito==="si"?" chip-on":"")} onClick={()=>setForm(f=>({...f,circuito:"si", montoFinal: f.neto? Math.round(r(f.neto)*IVA) : f.montoFinal}))}>Sí</span>
              </div>
            </div>

            {form.circuito==="si" && (
              <div className="field-row">
                <div className="field"><label>Monto final (con IVA)</label>
                  <MoneyInput value={form.montoFinal} onChange={v=>setForm(f=>setNetoFromFinal(f, v))}/>
                </div>
                <div className="field"><label>Neto (sin IVA, calculado)</label>
                  <MoneyInput value={form.neto} onChange={v=>setForm(f=>setFinalFromNeto(f, v))}/>
                </div>
              </div>
            )}

            <div className="field-row">
              {form.circuito!=="si" && (
                <div className="field"><label>Neto</label><MoneyInput value={form.neto} onChange={v=>setForm(f=>setFinalFromNeto(f, v))}/></div>
              )}
              <div className="field"><label>Costo %</label><input className="input" type="number" value={form.costoPct} onChange={e=>setForm(f=>calcDerived({...f,costoPct:e.target.value}))}/></div>
              <div className="field"><label>Venta %</label><input className="input" type="number" value={form.ventaPct} onChange={e=>setForm(f=>calcDerived({...f,ventaPct:e.target.value}))}/></div>
            </div>
            <div className="field-row">
              <div className="field"><label>A pagar (calculado)</label><MoneyInput value={form.aPagar} onChange={v=>setForm(f=>({...f,aPagar:v}))}/></div>
              <div className="field"><label>% Percepción</label><input className="input" type="number" value={form.perc} onChange={e=>setForm(f=>calcDerived({...f,perc:e.target.value}))}/></div>
              <div className="field"><label>A cobrar (calculado)</label><MoneyInput value={form.aCobrar} onChange={v=>setForm(f=>({...f,aCobrar:v}))}/></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Billete</label><MoneyInput value={form.bille} onChange={v=>setForm(f=>calcDerived({...f,bille:v}))}/></div>
              <div className="field"><label>Ganancia (calculada)</label><MoneyInput value={form.ganancia} onChange={v=>setForm(f=>({...f,ganancia:v}))}/></div>
            </div>
            <button type="submit" className="exp-btn full" style={{marginTop:10, background:INK, color:PAPER_CARD}}>Guardar movimiento</button>
            </form>
          </div>
        </div>
      )}

      {bulkInvForm && (
        <div className="overlay" onClick={()=>setBulkInvForm(null)}>
          <div className="panel" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:17}}>Revisar facturas</div>
              <X size={20} onClick={()=>setBulkInvForm(null)}/>
            </div>
            <div className="muted" style={{marginBottom:10}}>
              Encontré {bulkInvForm.items.length} factura{bulkInvForm.items.length!==1?"s":""}. Completá o corregí proveedor, cliente y porcentajes antes de guardar.
            </div>
            {bulkInvForm.items.map((it, idx)=>(
              <div key={idx} className="check-card">
                <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                  <b style={{fontSize:12}}>Factura #{idx+1}{it.numero ? ` — Nº ${it.numero}` : ""}</b>
                  <X size={15} style={{cursor:"pointer", color:RED}} onClick={()=>removeBulkInvItem(idx)}/>
                </div>
                {it.empresaDetectada && <div className="muted" style={{fontSize:10.5, marginBottom:6}}>Empresa detectada en la foto: <b>{it.empresaDetectada}</b></div>}
                <div className="field-row">
                  <div className="field"><label>Mes</label>
                    <select className="input" value={it.mes} onChange={e=>updateBulkInvItem(idx,{mes:e.target.value})}>
                      {MONTHS.map(m=><option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="field"><label>Fecha</label>
                    <input className="input" type="date" value={ddmmyyToISO(it.fecha)} onChange={e=>updateBulkInvItem(idx,{fecha:isoToDDMMYY(e.target.value)})}/>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Proveedor</label>
                    <Combobox value={it.proveedor} onChange={v=>updateBulkInvItem(idx, suggestFromHistory({...it,proveedor:v}, "proveedor", v))} options={entities.providers} placeholder="Empezá a tipear…"/>
                  </div>
                  <div className="field"><label>Empresa</label>
                    <Combobox value={it.contactoProv} onChange={v=>updateBulkInvItem(idx,{contactoProv:v})} options={entities.contactosProv||[]} placeholder="Empezá a tipear…"/>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Cliente</label>
                    <Combobox value={it.cliente} onChange={v=>updateBulkInvItem(idx, suggestFromHistory({...it,cliente:v}, "cliente", v))} options={entities.clients} placeholder="Empezá a tipear…"/>
                  </div>
                  <div className="field"><label>Facturado a</label>
                    <Combobox value={it.contactoCli} onChange={v=>updateBulkInvItem(idx,{contactoCli:v})} options={entities.contactosCli||[]} placeholder="Empezá a tipear…"/>
                  </div>
                </div>
                <div className="field-row">
                  <div className="field"><label>Neto</label><MoneyInput value={it.neto} onChange={v=>updateBulkInvItem(idx,{neto:v})}/></div>
                  <div className="field"><label>Costo %</label><input className="input" type="number" value={it.costoPct} onChange={e=>updateBulkInvItem(idx,{costoPct:e.target.value})}/></div>
                  <div className="field"><label>Venta %</label><input className="input" type="number" value={it.ventaPct} onChange={e=>updateBulkInvItem(idx,{ventaPct:e.target.value})}/></div>
                </div>
                <div className="field-row">
                  <div className="field"><label>% Percepción</label><input className="input" type="number" value={it.perc} onChange={e=>updateBulkInvItem(idx,{perc:e.target.value})}/></div>
                  <div className="field"><label>Billete</label><MoneyInput value={it.bille} onChange={v=>updateBulkInvItem(idx,{bille:v})}/></div>
                </div>
              </div>
            ))}
            <button className="exp-btn full" style={{marginTop:10, background:INK, color:PAPER_CARD}} onClick={confirmBulkInvSave} disabled={bulkInvForm.items.length===0}>
              Guardar {bulkInvForm.items.length} movimiento{bulkInvForm.items.length!==1?"s":""}
            </button>
          </div>
        </div>
      )}

      {showExport && (
        <div className="overlay" onClick={()=>setShowExport(false)}>
          <div className="panel" onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12}}>
              <div style={{fontFamily:"Fraunces, serif", fontWeight:700, fontSize:17}}>Exportar cliente/proveedor</div>
              <X size={20} onClick={()=>setShowExport(false)}/>
            </div>

            <div className="col-chips" style={{marginBottom:10}}>
              <span className={"chip"+(expTipo==="cliente"?" chip-on":"")} onClick={()=>chooseExpTipo("cliente")}>Cliente</span>
              <span className={"chip"+(expTipo==="proveedor"?" chip-on":"")} onClick={()=>chooseExpTipo("proveedor")}>Proveedor</span>
            </div>

            <label>{expTipo==="cliente"?"Cliente":"Proveedor"}</label>
            <Combobox value={expSel} onChange={setExpSel} options={expNames} placeholder="Empezá a tipear…"/>

            <div style={{marginTop:10}}>
              <label>Mes</label>
              <select className="input" value={expMonth} onChange={e=>setExpMonth(e.target.value)} style={{marginBottom:10}}>
                <option value="TODOS">Todo el año</option>
                {MONTHS.map(m=><option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
              </select>
            </div>

            <div className="demo-title">Columnas a mostrar en el PDF</div>
            <div className="muted" style={{fontSize:10.5, marginBottom:6}}>
              {expTipo==="cliente" ? "Por defecto no se muestran tus costos ni tu ganancia." : "Por defecto no se muestra el precio de venta ni los datos del cliente."}
            </div>
            <button className="pill" style={{marginBottom:8}} onClick={presetClienteCols}>📋 Estado para cliente (Mes, Empresa, Neto, %Venta, %Perc, Total)</button>
            <div className="col-chips" style={{marginBottom:12}}>
              {ENTITY_PDF_COLUMNS.map(c=>(
                <span key={c.key} className={"chip"+(expCols[c.key]?" chip-on":"")} onClick={()=>toggleExpCol(c.key)}>{c.label}</span>
              ))}
            </div>

            <button className="exp-btn full" style={{background:INK, color:PAPER_CARD}} onClick={exportEntityFromMonth}>Generar PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}


function ChequesView({checks, movements, onNew, onBulkNew, onDelete, onApply, onUnapply, pendienteCobrar, pendientePagar}){
  const [filtro, setFiltro] = useState("todos");
  const [applyingId, setApplyingId] = useState(null);

  const list = checks.filter(c=> filtro==="todos" || c.tipo===filtro).sort((a,b)=> new Date(b.fecha||0)-new Date(a.fecha||0));
  const totalEntrada = checks.filter(c=>c.tipo==="entrada").reduce((s,c)=>s+r(c.monto),0);
  const totalSalida = checks.filter(c=>c.tipo==="salida").reduce((s,c)=>s+r(c.monto),0);
  const pendientesN = checks.filter(c=>c.estado==="pendiente").length;

  const candidateMovs = (c) => {
    const base = movements.filter(m => c.tipo==="entrada" ? pendienteCobrar(m)>0 : pendientePagar(m)>0);
    if(!c.contraparte) return base;
    const matched = base.filter(m => (c.tipo==="entrada" ? m.cliente : m.proveedor) === c.contraparte);
    return matched.length>0 ? matched : base;
  };

  return (
    <div className="sheet" style={{margin:"14px 12px"}}>
      <div className="stats">
        <div className="stat gan"><div className="lbl">Entradas</div><div className="val">{fmt(totalEntrada)}</div></div>
        <div className="stat cobrar"><div className="lbl">Salidas</div><div className="val">{fmt(totalSalida)}</div></div>
        <div className="stat"><div className="lbl">Pendientes</div><div className="val">{pendientesN}</div></div>
      </div>

      <div className="col-chips" style={{marginBottom:12}}>
        {[["todos","Todos"],["entrada","Entradas"],["salida","Salidas"]].map(([k,l])=>(
          <span key={k} className={"chip"+(filtro===k?" chip-on":"")} onClick={()=>setFiltro(k)}>{l}</span>
        ))}
      </div>

      {list.length===0 ? (
        <div className="empty"><b>Sin pagos cargados</b>Acá registrás los cheques, efectivo o transferencias que te pagan tus clientes, y los que vos le pagás a tus proveedores.</div>
      ) : list.map(c=>{
        const medioIcon = c.medioPago==="efectivo" ? "💵" : c.medioPago==="transferencia" ? "🏦" : "🧾";
        const medioLabel = c.medioPago==="efectivo" ? "Efectivo" : c.medioPago==="transferencia" ? "Transferencia" : `${c.banco || "s/banco"} #${c.numero || "—"}`;
        return (
        <div key={c.id} className="check-card">
          <div style={{display:"flex", justifyContent:"space-between"}}>
            <div>
              <div style={{fontWeight:700, fontSize:13}}>{c.tipo==="entrada"?"⬇️ Entrada":"⬆️ Salida"} · {medioIcon} {medioLabel}</div>
              <div className="muted" style={{fontSize:11}}>{c.contraparte || "sin contraparte"} · {c.fechaCobro || "—"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'IBM Plex Mono',monospace", fontWeight:600}}>{fmt(c.monto)}</div>
              <span className={"badge "+(c.estado==="aplicado"?"badge-ok":"badge-pend")}>{c.estado}</span>
            </div>
          </div>
          <div style={{display:"flex", gap:8, marginTop:8}}>
            {c.estado==="pendiente" ? (
              applyingId===c.id ? (
                <select className="input" style={{fontSize:11}} onChange={e=>{ if(e.target.value){ onApply(c.id, e.target.value); setApplyingId(null);} }}>
                  <option value="">Elegí un movimiento…</option>
                  {candidateMovs(c).map(m=>(
                    <option key={m.id} value={m.id}>{c.tipo==="entrada"?m.cliente:m.proveedor} — pend. {fmt(c.tipo==="entrada"?pendienteCobrar(m):pendientePagar(m))}</option>
                  ))}
                </select>
              ) : (
                <button className="exp-btn" style={{flex:1}} onClick={()=>setApplyingId(c.id)}>Aplicar a movimiento</button>
              )
            ) : (
              <button className="exp-btn" style={{flex:1}} onClick={()=>onUnapply(c.id)}>Desaplicar</button>
            )}
            <Trash2 size={16} style={{color:RED, cursor:"pointer", alignSelf:"center"}} onClick={()=>{ if(confirm("¿Eliminar pago?")) onDelete(c.id); }}/>
          </div>
        </div>
        );
      })}

      <button className="addbtn" onClick={onNew}><Plus size={15}/> Nuevo pago</button>
      <button className="addbtn" style={{marginTop:8}} onClick={onBulkNew}><Camera size={15}/> Cargar varios cheques (foto)</button>
    </div>
  );
}

const ENTITY_PDF_COLUMNS = [
  {key:"mes", label:"Mes"},{key:"fecha", label:"Fecha"},{key:"contraparte", label:"Cliente/Proveedor"},
  {key:"neto", label:"Neto"},{key:"costoPct", label:"Costo %"},{key:"ventaPct", label:"Venta %"},
  {key:"aPagar", label:"A pagar"},{key:"perc", label:"% Percepción"},{key:"aCobrar", label:"A cobrar"},{key:"pendiente", label:"Pendiente"},{key:"ganancia", label:"Ganancia"},
];

function CuentasView({tipo, setTipo, sel, setSel, entities, entityMovs, entitySaldo, pendienteCobrar, pendientePagar, rankBy, movements, statsFor}){
  const [modo, setModo] = useState("individual"); // individual | resumen
  const names = sortAlpha(tipo==="cliente" ? entities.clients : entities.providers);
  const movs = sel ? entityMovs(tipo, sel) : [];
  const saldo = sel ? entitySaldo(tipo, sel) : 0;
  const ranking = rankBy(tipo==="cliente"?"cliente":"proveedor");
  const [showPdfPanel, setShowPdfPanel] = useState(false);
  const CLIENT_DEFAULT_COLS = {mes:true, fecha:true, contraparte:true, neto:true, costoPct:false, ventaPct:true, aPagar:false, perc:true, aCobrar:true, pendiente:false, ganancia:false};
  const PROVIDER_DEFAULT_COLS = {mes:true, fecha:true, contraparte:false, neto:true, costoPct:true, ventaPct:false, aPagar:true, perc:false, aCobrar:false, pendiente:false, ganancia:false};
  const [pdfCols, setPdfCols] = useState(CLIENT_DEFAULT_COLS);
  const [pdfMonths, setPdfMonths] = useState(() => Object.fromEntries(MONTHS.map(m=>[m,true])));
  const togglePdfCol = (k) => setPdfCols(c=>({...c, [k]: !c[k]}));
  const presetClienteCols = () => setPdfCols({mes:true, fecha:false, contraparte:true, neto:true, costoPct:false, ventaPct:true, aPagar:false, perc:true, aCobrar:true, pendiente:false, ganancia:false});
  const togglePdfMonth = (m) => setPdfMonths(c=>({...c, [m]: !c[m]}));
  const allPdfMonths = () => setPdfMonths(Object.fromEntries(MONTHS.map(m=>[m,true])));
  const nonePdfMonths = () => setPdfMonths(Object.fromEntries(MONTHS.map(m=>[m,false])));
  const chooseTipo = (t) => {
    setTipo(t); setSel("");
    setPdfCols(t==="cliente" ? CLIENT_DEFAULT_COLS : PROVIDER_DEFAULT_COLS);
  };

  const [resMonth, setResMonth] = useState("ANUAL");
  const [resFiltro, setResFiltro] = useState("");
  const [resCols, setResCols] = useState({pendiente:true, neto:false, cant:false});
  const toggleResCol = (k) => setResCols(c=>({...c, [k]: !c[k]}));

  const [listMonth, setListMonth] = useState("TODOS");
  const [listCols, setListCols] = useState({fecha:false, neto:true, ventaPct:false, perc:false, pendiente:true});
  const toggleListCol = (k) => setListCols(c=>({...c, [k]: !c[k]}));

  const enviarRecordatorio = () => {
    const texto = `Hola ${sel}! Te escribo para recordarte el saldo pendiente de ${fmt(saldo)}. Cualquier consulta quedo atento. ¡Gracias!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank");
  };

  const exportEntityPDF = () => {
    const filteredMovs = movs.filter(m=>pdfMonths[m.mes]);
    if(filteredMovs.length===0){ alert("No hay movimientos para exportar con esos filtros."); return; }
    const cols = ENTITY_PDF_COLUMNS.filter(c=>pdfCols[c.key]);
    if(cols.length===0){ alert("Elegí al menos una columna."); return; }
    const rows = filteredMovs.map(m=>{
      const row = {};
      cols.forEach(c=>{
        if(c.key==="contraparte") row[c.label] = tipo==="cliente" ? `${m.proveedor} ${m.contactoProv||""}`.trim() : `${m.cliente} ${m.contactoCli||""}`.trim();
        else if(c.key==="pendiente") row[c.label] = fmt(tipo==="cliente" ? pendienteCobrar(m) : pendientePagar(m));
        else if(["neto","aPagar","aCobrar","ganancia"].includes(c.key)) row[c.label] = fmt(m[c.key]);
        else if(c.key==="costoPct" || c.key==="ventaPct" || c.key==="perc") row[c.label] = m[c.key] + "%";
        else row[c.label] = m[c.key] || "—";
      });
      return row;
    });
    const headers = Object.keys(rows[0]);
    const mesesTxt = MONTHS.filter(m=>pdfMonths[m]).length===12 ? "Todo el año" : MONTHS.filter(m=>pdfMonths[m]).join(", ");
    const saldoColor = saldo>0 && tipo==="cliente" ? "#B23B3B" : "#333";
    const body = `<h2>${sel}</h2><div class="sub">Período: ${mesesTxt}</div><div class="saldo" style="color:${saldoColor}">Saldo pendiente total: ${fmt(saldo)}</div>
      <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>
      ${rows.map(row=>`<tr>${headers.map(h=>`<td>${row[h]}</td>`).join("")}</tr>`).join("")}
      </tbody></table>`;
    downloadPrintable(`${sel.replace(/[^a-z0-9]/gi,"-")}.html`, sel, body);
    alert("Se descargó un archivo. Abrilo y elegí 'Imprimir → Guardar como PDF' para tener el PDF final.");
  };

  // ---- resumen general (todos los clientes/proveedores de un mes) ----
  const scopeMovs = resMonth==="ANUAL" ? movements : movements.filter(m=>m.mes===resMonth);
  const groupPend = (field, pendFn) => {
    const acc = {};
    scopeMovs.forEach(m=>{
      const key = m[field];
      if(!acc[key]) acc[key] = {pendiente:0, neto:0, cant:0};
      acc[key].pendiente += pendFn(m);
      acc[key].neto += r(m.neto);
      acc[key].cant += 1;
    });
    return Object.entries(acc)
      .filter(([,v])=>v.pendiente>0)
      .filter(([name])=> !resFiltro || name.toLowerCase().includes(resFiltro.toLowerCase()))
      .sort((a,b)=>b[1].pendiente-a[1].pendiente);
  };
  const clientesPend = groupPend("cliente", pendienteCobrar);
  const proveedoresPend = groupPend("proveedor", pendientePagar);
  const resStats = statsFor(resMonth);

  const RES_COL_LIST = [{key:"pendiente",label:"Pendiente"},{key:"neto",label:"Neto total"},{key:"cant",label:"Cant. movim."}];
  const LIST_COL_LIST = [{key:"fecha",label:"Fecha"},{key:"neto",label:"Neto"},{key:"ventaPct",label:"Venta %"},{key:"perc",label:"Perc %"},{key:"pendiente",label:"Pendiente"}];

  return (
    <div className="sheet" style={{margin:"14px 12px"}}>
      <div className="col-chips" style={{marginBottom:14}}>
        <span className={"chip"+(modo==="individual"?" chip-on":"")} onClick={()=>setModo("individual")}>Por cliente/proveedor</span>
        <span className={"chip"+(modo==="resumen"?" chip-on":"")} onClick={()=>setModo("resumen")}>📋 Resumen general</span>
      </div>

      {modo==="resumen" ? (
        <div>
          <select className="input" value={resMonth} onChange={e=>setResMonth(e.target.value)} style={{marginBottom:10}}>
            <option value="ANUAL">Todo el año</option>
            {MONTHS.map(m=><option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
          </select>

          <div className="stats" style={{marginBottom:14}}>
            <div className="stat debo"><div className="lbl">Debo</div><div className="val">{fmt(resStats.aPagar)}</div></div>
            <div className="stat cobrar"><div className="lbl">Me deben</div><div className="val">{fmt(resStats.aCobrar)}</div></div>
            <div className="stat gan"><div className="lbl">Ganancia</div><div className="val">{fmt(resStats.ganancia)}</div></div>
          </div>

          <div className="demo-title">🔎 Filtro</div>
          <input className="input" style={{marginBottom:8}} placeholder="Buscar por nombre…" value={resFiltro} onChange={e=>setResFiltro(e.target.value)}/>
          <div className="demo-title" style={{marginTop:4}}>Columnas a mostrar</div>
          <div className="col-chips" style={{marginBottom:14}}>
            {RES_COL_LIST.map(c=>(
              <span key={c.key} className={"chip"+(resCols[c.key]?" chip-on":"")} onClick={()=>toggleResCol(c.key)}>{c.label}</span>
            ))}
          </div>

          <div className="demo-title">👤 Clientes que me deben</div>
          {clientesPend.length===0 && <div className="muted" style={{marginBottom:12}}>Nadie te debe en este período.</div>}
          {clientesPend.map(([name,v])=>(
            <div key={name} className="result-row debtrow">
              <span>{name}</span>
              <span>
                {resCols.cant && <span style={{marginRight:8, fontSize:10.5}}>{v.cant} mov.</span>}
                {resCols.neto && <span style={{marginRight:8, fontSize:10.5}}>Neto {fmt(v.neto)}</span>}
                {resCols.pendiente && fmt(v.pendiente)}
              </span>
            </div>
          ))}

          <div className="demo-title" style={{marginTop:16}}>🚚 Proveedores a los que les debo</div>
          {proveedoresPend.length===0 && <div className="muted">No le debés a nadie en este período.</div>}
          {proveedoresPend.map(([name,v])=>(
            <div key={name} className="result-row debtrow">
              <span>{name}</span>
              <span>
                {resCols.cant && <span style={{marginRight:8, fontSize:10.5}}>{v.cant} mov.</span>}
                {resCols.neto && <span style={{marginRight:8, fontSize:10.5}}>Neto {fmt(v.neto)}</span>}
                {resCols.pendiente && fmt(v.pendiente)}
              </span>
            </div>
          ))}
        </div>
      ) : (
      <div>
      <div className="col-chips" style={{marginBottom:10}}>
        <span className={"chip"+(tipo==="cliente"?" chip-on":"")} onClick={()=>chooseTipo("cliente")}>Clientes</span>
        <span className={"chip"+(tipo==="proveedor"?" chip-on":"")} onClick={()=>chooseTipo("proveedor")}>Proveedores</span>
      </div>

      <Combobox value={sel} onChange={setSel} options={names} placeholder={`Empezá a tipear un ${tipo==="cliente"?"cliente":"proveedor"}…`}/>

      {sel && (
        <div style={{marginTop:14}}>
          <div className={"stat "+(tipo==="cliente" && saldo>0 ? "debtstat" : "gan")} style={{marginBottom:12}}>
            <div className="lbl">Saldo pendiente de {sel}</div>
            <div className="val" style={{fontSize:19}}>{fmt(saldo)}</div>
          </div>
          <div style={{display:"flex", gap:8, marginBottom:12}}>
            {tipo==="cliente" && saldo>0 && (
              <button className="exp-btn wa" style={{flex:1}} onClick={enviarRecordatorio}><MessageCircle size={14}/> WhatsApp</button>
            )}
            <button className="exp-btn" style={{flex:1}} onClick={()=>setShowPdfPanel(s=>!s)}><Download size={14}/> Exportar PDF</button>
          </div>

          {showPdfPanel && (
            <div style={{background:PAPER, border:`1px dashed ${LINE}`, borderRadius:8, padding:10, marginBottom:14}}>
              <div className="demo-title">Meses a incluir</div>
              <div className="col-chips" style={{marginBottom:6}}>
                {MONTHS.map(m=>(
                  <span key={m} className={"chip"+(pdfMonths[m]?" chip-on":"")} onClick={()=>togglePdfMonth(m)}>{m}</span>
                ))}
              </div>
              <div style={{display:"flex", gap:6, marginBottom:12}}>
                <button className="pill" onClick={allPdfMonths}>Todos</button>
                <button className="pill" onClick={nonePdfMonths}>Ninguno</button>
              </div>
              <div className="demo-title">Columnas a mostrar</div>
              <div className="muted" style={{fontSize:10.5, marginBottom:6}}>
                {tipo==="cliente" ? "Por defecto no se muestran tus costos ni tu ganancia." : "Por defecto no se muestra el precio de venta ni los datos del cliente."}
              </div>
              <button className="pill" style={{marginBottom:8}} onClick={presetClienteCols}>📋 Estado para cliente (Mes, Empresa, Neto, %Venta, %Perc, Total)</button>
              <div className="col-chips" style={{marginBottom:10}}>
                {ENTITY_PDF_COLUMNS.map(c=>(
                  <span key={c.key} className={"chip"+(pdfCols[c.key]?" chip-on":"")} onClick={()=>togglePdfCol(c.key)}>{c.label}</span>
                ))}
              </div>
              <button className="exp-btn full" style={{background:INK, color:PAPER_CARD}} onClick={exportEntityPDF}>Generar PDF de {sel}</button>
            </div>
          )}

          <div className="demo-title">🔎 Filtro por mes</div>
          <select className="input" style={{marginBottom:8}} value={listMonth} onChange={e=>setListMonth(e.target.value)}>
            <option value="TODOS">Todos los meses</option>
            {MONTHS.map(m=><option key={m} value={m}>{MONTH_NAMES[m]}</option>)}
          </select>
          <div className="demo-title">Columnas a mostrar</div>
          <div className="col-chips" style={{marginBottom:10}}>
            {LIST_COL_LIST.map(c=>(
              <span key={c.key} className={"chip"+(listCols[c.key]?" chip-on":"")} onClick={()=>toggleListCol(c.key)}>{c.label}</span>
            ))}
          </div>

          <div className="demo-title">Movimientos ({movs.filter(m=>listMonth==="TODOS"||m.mes===listMonth).length})</div>
          {movs.filter(m=>listMonth==="TODOS"||m.mes===listMonth).map(m=>{
            const pend = tipo==="cliente" ? pendienteCobrar(m) : pendientePagar(m);
            return (
              <div key={m.id} className={"result-row"+(pend>0?" debtrow":"")}>
                <span>{m.mes} · {tipo==="cliente"?m.proveedor:m.cliente}{listCols.fecha && m.fecha ? ` (${m.fecha})` : ""}</span>
                <span className="muted">
                  {listCols.neto && <span style={{marginRight:8}}>Neto {fmt(m.neto)}</span>}
                  {listCols.ventaPct && <span style={{marginRight:8}}>V {m.ventaPct}%</span>}
                  {listCols.perc && <span style={{marginRight:8}}>P {m.perc||0}%</span>}
                  {listCols.pendiente && `pend. ${fmt(pend)}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div style={{marginTop:18, borderTop:`1px dashed ${LINE}`, paddingTop:12}}>
        <div className="demo-title">🏆 Ranking — top 5 {tipo==="cliente"?"clientes":"proveedores"} (por neto)</div>
        {ranking.map(([name,total],i)=>(
          <div key={name} className="result-row">{i+1}. {name} <span className="muted">{fmt(total)}</span></div>
        ))}
      </div>
      </div>
      )}
    </div>
  );
}

function ResumenView({monthGanancia, monthCosto, monthCobrar}){
  const values = MONTHS.map(m=>monthGanancia(m));
  const max = Math.max(...values, 1);
  const totalGanancia = values.reduce((a,b)=>a+b,0);
  const totalCosto = MONTHS.reduce((s,m)=>s+monthCosto(m),0);
  const totalCobrar = MONTHS.reduce((s,m)=>s+monthCobrar(m),0);

  return (
    <div className="sheet" style={{margin:"14px 12px"}}>
      <div className="stats">
        <div className="stat gan"><div className="lbl">Ganancia acum.</div><div className="val">{fmt(totalGanancia)}</div></div>
        <div className="stat cobrar"><div className="lbl">Vendido (cobrar)</div><div className="val">{fmt(totalCobrar)}</div></div>
        <div className="stat"><div className="lbl">Costo total</div><div className="val">{fmt(totalCosto)}</div></div>
      </div>

      <div className="demo-title">Ganancia por mes</div>
      <div className="chart">
        {MONTHS.map((m,i)=>(
          <div key={m} className="bar-col">
            <div className="bar" style={{height: Math.max(4, (values[i]/max)*110)+"px"}} title={fmt(values[i])}></div>
            <div className="bar-label">{m}</div>
          </div>
        ))}
      </div>

      <div className="demo-title" style={{marginTop:16}}>Costo anual por mes</div>
      <table>
        <thead><tr><th>Mes</th><th>Costo (a pagar)</th><th>Ganancia</th></tr></thead>
        <tbody>
          {MONTHS.map(m=>(
            <tr key={m}><td className="name">{MONTH_NAMES[m]}</td><td>{fmt(monthCosto(m))}</td><td>{fmt(monthGanancia(m))}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============ STYLE ============
const PAPER = "#EAF8EF", PAPER_CARD="#FFFFFF", LINE="#CDEBD9", LINE_SOFT="#E3F5EA", INK="#1F4A32", INK_SOFT="#5C8A6E", GOLD="#2E9E5B", RED="#BF5B4A", RED_BG="#FBEAE5";

function GlobalStyle(){
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      * { box-sizing: border-box; }
      body { margin:0; }
      .iconbtn { border:1px solid ${LINE}; background:${PAPER_CARD}; border-radius:8px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; color:${INK}; }
      .alert-banner { margin:0 12px 10px; background:${RED_BG}; color:${RED}; border:1px solid ${RED}; border-radius:8px; padding:9px 10px; font-size:12px; display:flex; align-items:center; gap:8px; cursor:pointer; }
      .alert-banner span { flex:1; }
      .tabs { display:flex; overflow-x:auto; gap:0; padding:6px 12px 0; scrollbar-width:none; }
      .tabs::-webkit-scrollbar { display:none; }
      .tab { flex-shrink:0; font-family:'IBM Plex Mono',monospace; font-size:11px; font-weight:600; letter-spacing:0.03em; padding:8px 12px 6px; background:#CDEBD9; color:${INK_SOFT}; clip-path: polygon(8% 0, 92% 0, 100% 100%, 0% 100%); margin-right:-6px; cursor:pointer; border:none; }
      .tab.active { background:${PAPER_CARD}; color:${INK}; transform:translateY(-3px); box-shadow:0 -2px 6px rgba(31,59,44,0.08); z-index:2; }
      .tab.anual { background:${GOLD}; color:#fff; }
      .tab.anual.active { background:#1F4A32; }
      .sheet { background:${PAPER_CARD}; margin:0 12px 16px; border-radius:0 10px 10px 10px; border:1px solid ${LINE_SOFT}; box-shadow:0 4px 14px rgba(31,59,44,0.06); padding:14px 12px; }
      .stats { display:flex; gap:8px; margin-bottom:14px; }
      .stat { flex:1; min-width:0; background:${PAPER}; border:1px solid ${LINE_SOFT}; border-radius:8px; padding:9px 6px; overflow-x:auto; }
      .stat .lbl { font-size:9px; text-transform:uppercase; letter-spacing:0.05em; color:${INK_SOFT}; font-weight:600; }
      .stat .val { font-family:'IBM Plex Mono',monospace; font-size:12.5px; font-weight:600; margin-top:3px; white-space:nowrap; }
      .stat.gan { background:#DFF2E6; border-color:${GOLD}; }
      .stat.gan .val { color:${GOLD}; }
      .stat.cobrar .val { color:${GOLD}; }
      .stat.debo .val { color:${RED}; }
      .stat.debtstat { background:${RED_BG}; border-color:${RED}; }
      .stat.debtstat .val { color:${RED}; }
      table { width:100%; border-collapse:collapse; font-size:11px; }
      th { text-align:left; font-size:8.5px; text-transform:uppercase; letter-spacing:0.04em; color:${INK_SOFT}; font-weight:600; padding:4px 4px 6px; border-bottom:1.5px solid ${INK}; white-space:nowrap; }
      td { padding:5px 3px; border-bottom:1px solid ${LINE_SOFT}; font-family:'IBM Plex Mono',monospace; font-size:10.5px; white-space:nowrap; position:relative; }
      td.name { font-family:'Inter',sans-serif; font-weight:600; font-size:11px; }
      tbody tr:nth-child(odd) td { background:#FFFFFF; }
      tbody tr:nth-child(even) td { background:#E9F8EF; }
      .cellinput { width:100%; border:none; background:transparent; font-family:inherit; font-size:inherit; color:inherit; padding:2px; min-width:60px; }
      .cellinput:focus { outline:1px solid ${GOLD}; background:#fff; border-radius:3px; }
      .tag-debe { display:inline-block; background:${RED}; color:#fff; font-size:7.5px; font-weight:700; padding:1px 4px; border-radius:3px; margin-left:4px; }
      .empty { padding:26px 10px; text-align:center; color:${INK_SOFT}; font-size:12px; }
      .empty b { display:block; color:${INK}; font-family:'Fraunces',serif; font-size:15px; margin-bottom:4px; font-weight:600; }
      .addbtn { width:100%; margin-top:12px; border:1.5px dashed ${LINE}; background:transparent; border-radius:8px; padding:10px; font-size:12px; font-weight:600; color:${INK_SOFT}; display:flex; align-items:center; justify-content:center; gap:6px; }
      .bottomnav { position:fixed; bottom:0; left:0; right:0; background:${PAPER_CARD}; border-top:1px solid ${LINE_SOFT}; display:flex; padding:8px 0 calc(10px + env(safe-area-inset-bottom, 0px)); max-width:480px; margin:0 auto; }
      .navbtn { flex:1; min-height:44px; background:none; border:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px; color:${INK_SOFT}; padding:6px 4px; }
      .navbtn-on { color:${INK}; font-weight:700; }
      .overlay { position:fixed; inset:0; background:rgba(31,59,44,0.45); display:flex; align-items:flex-end; z-index:50; }
      .panel { background:${PAPER_CARD}; width:100%; max-width:480px; margin:0 auto; border-radius:16px 16px 0 0; padding:18px 16px 26px; max-height:85vh; overflow-y:auto; }
      .pill { border:1px solid ${LINE}; background:${PAPER}; border-radius:14px; padding:5px 11px; font-size:11px; color:${INK_SOFT}; font-weight:600; }
      .pill-on { background:${INK}; color:${PAPER_CARD}; border-color:${INK}; }
      .input { width:100%; padding:8px; border:1px solid ${LINE}; border-radius:6px; background:#fff; font-family:'Inter',sans-serif; font-size:12.5px; color:${INK}; margin-top:2px; }
      .combo-list { position:absolute; top:100%; left:0; right:0; z-index:60; background:#fff; border:1px solid ${LINE}; border-radius:6px; margin-top:2px; max-height:180px; overflow-y:auto; box-shadow:0 6px 16px rgba(32,42,68,0.15); }
      .combo-item { padding:9px 10px; font-size:12.5px; color:${INK}; border-bottom:1px solid ${LINE_SOFT}; cursor:pointer; }
      .combo-item:last-child { border-bottom:none; }
      .combo-item:active { background:${PAPER}; }
      label { font-size:9.5px; color:${INK_SOFT}; font-weight:600; display:block; margin-bottom:2px; }
      .field-row { display:flex; gap:8px; margin-bottom:8px; }
      .field { flex:1; }
      .col-chips { display:flex; flex-wrap:wrap; gap:6px; }
      .chip { font-size:10px; border:1px solid ${LINE}; background:${PAPER}; padding:5px 9px; border-radius:14px; color:${INK_SOFT}; cursor:pointer; }
      .chip-on { background:${INK}; color:${PAPER_CARD}; border-color:${INK}; }
      .exp-btn { border:1px solid ${INK}; background:transparent; border-radius:7px; padding:9px 10px; font-size:11px; font-weight:600; color:${INK}; display:flex; align-items:center; justify-content:center; gap:5px; }
      .exp-btn.full { width:100%; }
      .exp-btn.wa { background:#3d8f5b; color:#fff; border-color:#3d8f5b; }
      .muted { color:${INK_SOFT}; font-size:11px; }
      .result-row { padding:7px 2px; border-bottom:1px solid ${LINE_SOFT}; font-size:12px; display:flex; justify-content:space-between; }
      .result-row.debtrow { color:${RED}; }
      .hist-row { padding:7px 2px; border-bottom:1px solid ${LINE_SOFT}; font-size:11.5px; }
      .hist-time { font-size:9.5px; color:${INK_SOFT}; font-family:'IBM Plex Mono',monospace; }
      .check-card { background:${PAPER}; border:1px solid ${LINE_SOFT}; border-radius:8px; padding:10px; margin-bottom:8px; }
      .oneline-total { display:flex; justify-content:space-between; background:${PAPER}; border:1px solid ${LINE}; border-radius:8px; padding:10px 12px; margin:10px 0; font-family:'IBM Plex Mono',monospace; font-size:13px; }
      .badge { font-size:8.5px; font-weight:700; padding:2px 6px; border-radius:4px; text-transform:uppercase; }
      .badge-ok { background:#DCEFE1; color:#2c7a4b; }
      .badge-pend { background:#FBEAEA; color:${RED}; }
      .demo-title { font-size:10px; text-transform:uppercase; letter-spacing:0.05em; color:${INK_SOFT}; font-weight:700; margin-bottom:8px; }
      .chart { display:flex; align-items:flex-end; gap:4px; height:130px; padding-top:10px; }
      .bar-col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; height:100%; }
      .bar { width:100%; background:${GOLD}; border-radius:3px 3px 0 0; }
      .bar-label { font-size:8px; color:${INK_SOFT}; margin-top:4px; font-family:'IBM Plex Mono',monospace; }
    `}</style>
  );
}
