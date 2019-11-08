# StarGazer

Project originally written in 2016. Still in the process of converting it to modern packages.

## To Do

-

## Data Format

```
Byte-by-byte Description of file: hip2.dat

   Bytes Format Units    Label   Explanations

0   1-  6  I6    ---      HIP     Hipparcos identifier
1   8- 10  I3    ---      Sn      [0,159] Solution type new reduction (1)
2      12  I1    ---      So      [0,5] Solution type old reduction (2)
3      14  I1    ---      Nc      Number of components
4   16- 28 F13.10 rad      RArad   Right Ascension in ICRS, Ep=1991.25
5   30- 42 F13.10 rad      DErad   Declination in ICRS, Ep=1991.25
6   44- 50  F7.2  mas      Plx     Parallax
7   52- 59  F8.2  mas/yr   pmRA    Proper motion in Right Ascension
8   61- 68  F8.2  mas/yr   pmDE    Proper motion in Declination
9   70- 75  F6.2  mas     e_RArad  Formal error on RArad
10  77- 82  F6.2  mas     e_DErad  Formal error on DErad
11  84- 89  F6.2  mas      e_Plx   Formal error on Plx
12  91- 96  F6.2  mas/yr   e_pmRA  Formal error on pmRA
13  98-103  F6.2  mas/yr   e_pmDE  Formal error on pmDE
14  105-107  I3    ---      Ntr     Number of field transits used
15  109-113  F5.2  ---      F2      Goodness of fit
16  115-116  I2    %        F1      Percentage rejected data
17  118-123  F6.1  ---      var     Cosmic dispersion added (stochastic solution)
18  125-128  I4    ---      ic      Entry in one of the suppl.catalogues
19  130-136  F7.4  mag      Hpmag   Hipparcos magnitude
20  138-143  F6.4  mag     e_Hpmag  Error on mean Hpmag
21  145-149  F5.3  mag      sHp     Scatter of Hpmag
22  151  I1    ---      VA      [0,2] Reference to variability annex
23  153-158  F6.3  mag      B-V     Colour index
24  160-164  F5.3  mag      e_B-V   Formal error on colour index
25  166-171  F6.3  mag      V-I     V-I colour index
26  172-276 15F7.2 ---      UW      Upper-triangular weight matrix (G1)
```