// B-V colour index converter
// color index to temperature in kelvin
function bvToT(bv) {
    let t;

    // make sure bv is within its bounds [-0.4, 2] otherwise the math doesnt work
    if (bv < -0.4) {
        bv = -0.4;
    } else if (bv > 2) {
        bv = 2;
    }

    // found it online at http://www.wikiwand.com/en/Color_index
    t = 4600 * ((1 / ((0.92 * bv) + 1.7)) + (1 / ((0.92 * bv) + 0.62)));

    return t;
}

// temperature to CIE xyY Colorspace, assume Y is 1
function tToXyy(t) {
    let x, y, Y = 1; // Y is the luminance, I just assume full luminance for sanity

    // approximation of CIE xyY (http://www.wikiwand.com/en/CIE_1931_color_space) using https://en.wikipedia.org/wiki/Planckian_locus
    if (t >= 1667 && t <= 4000) {
        x = (-0.2661239 * (Math.pow(10, 9) / Math.pow(t, 3))) -
            (-0.2343580 * (Math.pow(10, 6) / Math.pow(t, 2))) +
            (0.8776956 * (Math.pow(10, 3) / t)) + 0.179910;
    } else if (t >= 4000 && t <= 25000) {
        x = (-3.0258469 * (Math.pow(10, 9) / Math.pow(t, 3))) +
            (2.1070379 * (Math.pow(10, 6) / Math.pow(t, 2))) +
            (0.2226347 * (Math.pow(10, 3) / t)) + 0.240390;
    }

    if (t >= 1667 && t <= 2222) {
        y = (-1.1063814 * Math.pow(x, 3)) -
            (1.34811020 * Math.pow(x, 2)) +
            (2.18555832 * x) -
            0.20219683;
    } else if (t >= 2222 && t <= 4000) {
        y = (-0.9549476 * Math.pow(x, 3)) -
            (1.37418593 * Math.pow(x, 2)) +
            (2.09137015 * x) -
            0.16748867;
    } else if (t >= 4000 && t <= 25000) {
        y = (3.0817580 * Math.pow(x, 3)) -
            (5.87338670 * Math.pow(x, 2)) +
            (3.75112997 * x) -
            0.37001483;
    }

    // console.log('xyY: ' + [x, y, Y]);

    return [x, y, Y];
}

// xyY Color space to XYZ, prepping for conversion to linear RGB
function xyYToXyz(xyY) {
    let X, Y, Z,
        x = xyY[0],
        y = xyY[1];

    // X and Z tristimulus values calculated using https://en.wikipedia.org/wiki/CIE_1931_color_space?oldformat=true#CIE_xy_chromaticity_diagram_and_the_CIE_xyY_color_space
    Y = xyY[2];
    X = (y === 0) ? 0 : (x * Y) / y;
    Z = (y === 0) ? 0 : ((1 - x - y) * Y) / y;

    return [X, Y, Z];
}

//XYZ color space to linear RGB, finally a format I recognize
function xyzToRgb(xyz) {
    let r, g, b,
        x = xyz[0],
        y = xyz[1],
        z = xyz[2];

    // using matrix from http://www.cs.rit.edu/~ncs/color/t_convert.html#RGB%20to%20XYZ%20&%20XYZ%20to%20RGB
    r = (3.2406 * x) +
        (-1.5372 * y) +
        (-0.4986 * z);

    g = (-0.9689 * x) +
        (1.8758 * y) +
        (0.0415 * z);

    b = (0.0557 * x) +
        (-0.2040 * y) +
        (1.0570 * z);

    // make sure the values didnt overflow
    r = (r > 1) ? 1 : r;
    g = (g > 1) ? 1 : g;
    b = (b > 1) ? 1 : b;

    return [r, g, b];
}

// Im supposed to gamma correct and convert to sRGB but right now it breaks things so TODO: fix this..
function gammaCorrect(rgb) {
    let a = 0.055,
        gamma = 2.2,
        R, G, B,
        r = rgb[0],
        g = rgb[1],
        b = rgb[2];

    // using https://en.wikipedia.org/wiki/SRGB?oldformat=true#The_forward_transformation_.28CIE_xyY_or_CIE_XYZ_to_sRGB.29
    /*R = (r <= 0.0031308) ? 12.92 * r : ((1 + r) * Math.pow(r, 1 / 2.2)) - a;
     G = (g <= 0.0031308) ? 12.92 * g : ((1 + g) * Math.pow(g, 1 / 2.2)) - a;
     B = (b <= 0.0031308) ? 12.92 * b : ((1 + b) * Math.pow(b, 1 / 2.2)) - a;*/

    /*R = Math.pow(r, 1 / gamma);
     G = Math.pow(g, 1 / gamma);
     B = Math.pow(b, 1 / gamma);*/

    R = r;
    G = g / 1.05; // idk but i messed up somewhere and this makes it look better
    B = b;

    R = (R > 1) ? 1 : R;
    G = (G > 1) ? 1 : G;
    B = (B > 1) ? 1 : B;

    // turn the 0-1 rgb value to 0-255
    return [Math.round(R * 255), Math.round(G * 255), Math.round(B * 255)];
}

// now put it all together!
function bvToRgb(bv) {
    let t, xyY, xyz, rgb, crgb;

    t = bvToT(bv);

    xyY = tToXyy(t);

    xyz = xyYToXyz(xyY);

    rgb = xyzToRgb(xyz);

    crgb = gammaCorrect(rgb);

    return crgb;
}

module.exports = bvToRgb;