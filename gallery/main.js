function calculateFeatures(hash) {
    let H = hash

    let T=Uint32Array.from([0,1,s=t=2,3].map(i=>parseInt(H.substr(i*8+5,8),16))),R=(a=1)=>a*(t=T[3],T[3]=T[2],T[2]=T[1],T[1]=s=T[0],t^=t<<11,T[0]^=(t^t>>>8)^(s>>>19),T[0]/2**32);

    // utilities
    let random=(a,b)=>b?a+R()*(b-a):a?R()*a:R()
    let randInt=(a,b)=>random(a,b)|0
    let randBool = (p=.5) => random() < p
    let coin = (p=.5) => randBool(p) ? -1 : 1
    let expRand=(a,b,p=2)=>b?a+(R()**p)*(b-a):a?(R()**p)*a:R()**p
    let randArr=arr=>arr[randInt(arr.length)]
    let lerp=(a,b,c)=>a+(b-a)*c
    let map=(n,a,b,c,d)=>lerp(c,d,(n-a)/(b-a))
    let array=n=>Array(n).fill(0).map((d,i)=>i)

    // features
    let groups = 5 + expRand(4) * coin() | 0
    let square = groups === 1 && randBool(.3)
    let filled = randBool(.3)
    let uncomplete = randBool(.2) ? 0 : expRand(1, 4)|0
    let order = randInt(3) //['normal', 'reverse', 'alternate']
    let cuts = randBool(.4) ? 0 : (expRand(1, 5) | 0)
    let spacing = randArr(['Extra-thin', 'Thin', 'Normal', 'Large'])
    let complexity = expRand(map(groups, 1, 10, 12, 6), map(groups, 1, 10, 6, 2))|0
    let scaling = randBool(.9) ? 1 : randArr([2, 3])
    let curvyness = randArr([0, .25, .5, .75, 1])
    let curves = array(groups).map(i => randBool(curvyness))
    curvyness = Math.round(curves.reduce((acc,d) => acc + d)/groups/.25)*.25
    let symmetric = randBool(1-(groups + complexity) / 10)
    let white = randBool(.3)

    let paletteId = randInt(55)
    let complementaryColor = randInt(5)

    return {
        hash: H,

        // paletteId,
        // palette: palette.join(', '),
        // groups,
        // square,
        // filled,
        // order,
        // uncomplete,
        // cuts,
        // complexity,
        // spacing,
        // scaling,
        // curvyness,
        // symmetric,
        // white,

        'Style': filled ? 'Architecture' : 'Graffiti',
        'Paragraphs': groups,
        'Square Format': square ? 'True' : 'False',
        'Symmetry': symmetric,
        'Direction': ['Classic', 'Alternate', 'Reverse'][order],
        'Zoom': scaling,
        'Cuts': cuts,
        'Spacing': spacing,
        'Curvyness': curvyness === 0 ? 0 : 1/curvyness,
        'Palette': paletteId,
        'Complementary Color': ['Red','Deep Pink','Yellow','DodgerBlue','Purple'][complementaryColor],
    }
};


document.addEventListener('DOMContentLoaded', e => document.querySelectorAll('img').forEach(img => img.onerror = function(){
    this.style.display = 'none'
}))

document.querySelector('.container').innerHTML = hashes.map((hash,i) => {
    const features = calculateFeatures(hash)
    const paletteId = features['Palette']
    let title = [`Concrete Letters #${i}`]
    let dataset = []
    for(let key in features) {
        if(key === 'Palette') title.push(`Palette: ${["Zeda","Bafe","Ink","Peck","Coast","Sabske","Went","JayOne","Rezist","Tempt","Chaka","Seen","Tlok","Felon","Swift","Spin","Drastic","Spek","Strem","Jace","Reyes","Sane","Aem","Ander","Dose","Keroz","Skrew","Xone","Guer","Rezo","Werl","Colorz","Spark","Sebl","Kavee","Revolt","Senz","Mkue","Cope2","Mire","Kadism","Omick","Lost","Gris","Sonick","Oxyd","Jazy","Smoker","Anchor","Kadster","Nesta","Trixter","Perl","Drane","Retna","Ogre","Seyce","Dash","Siao","Risk","Bonus","Reaker","Krave","Dear","Mask","Mencer","Pear","Sacer","Ahero","Violon","Junior161","Afroe","Shaken","Abra","Menu","Oclock","Aves","Saet","Rone","Trole","Wovoka","Zephyr","Ozey","Greyer","Brusk","Lobe","Style","Auger","Guess","Spei","Duke"][paletteId]}`)
        else title.push(`${key}: ${features[key]}`)
        
        dataset.push(`data-${key.replace(/\s+/g, '-')}="${features[key]}"`)
    }
    title = title.join('\n')
    dataset = dataset.join(' ')
    return {
        paletteId,
        html: `<div class="box" ${dataset}><img src="images/${hash}.png" title="${title}" loading="lazy"></div>`
    }
})
// .sort((a, b) => a.paletteId - b.paletteId)
.sort((a, b) => 1 - Math.random()*2)
.map(d => d.html).join('')


const imgs = document.querySelectorAll('.box')

imgs.forEach(img => img.addEventListener('click', e => console.log(img.dataset)))

mediumZoom('img', {
    margin: 10,
    background: 'rgba(10, 10, 10, .9)'
})

const filters = {
    paragraphs: 'All',
    style: 'All',
    squareFormat: 'All',
    direction: 'All',
    zoom: 'All',
    cuts: 'All',
    spacing: 'All',
    curvyness: 'All',
    palette: 0,
    complementaryColor: 'All',
}

const filtersProxy = new Proxy(filters, {
    set: function (target, key, value) {
        if(key === 'palette') value = Math.min(55, Math.max(0, value))
        // console.log(`${key} set to ${value}`);
        target[key] = value;
        updateFilters()
        return true;
    }
})

const updateFilters = (key, value) => {
    let keys = Object.keys(filters).filter(k => k !== 'palette' && filters[k] !== 'All')
    if(filters.palette !== 0) keys.push('palette')
    // console.log(keys)

    let l = keys.length
    imgs.forEach(img => {
        let hide = false
        for(let i = 0; i < l && !hide; i ++) {
            if(img.dataset[keys[i]] !== `${filters[keys[i]]}`) hide = true
        }
        img.style.display = hide ? 'none' : ''
    })
}

const resetFilters = _ => {
    filters.paragraphs = 'All'
    filters.style = 'All'
    filters.squareFormat = 'All'
    filters.direction = 'All'
    filters.zoom = 'All'
    filters.cuts = 'All'
    filters.spacing = 'All'
    filters.curvyness = 'All'
    filters.palett = 0
    filters.complementaryColor = 'All'
    
    imgs.forEach(img => img.style.display = '')
}

const gui = new ControlKit()
gui.addPanel({label: 'Filter'})
    .addStringInput(filtersProxy, 'paragraphs', {
        label: 'Paragraphs',
        presets: ['All', 1, 2, 3, 4, 5, 6, 7, 8],
    })
    .addStringInput(filtersProxy, 'style', {
        label: 'Style',
        presets: ['All', 'Architecture', 'Graffiti'],
    })
    .addStringInput(filtersProxy, 'squareFormat', {
        label: 'Square Format',
        presets: ['All', 'True', 'False'],
    })
    .addStringInput(filtersProxy, 'direction', {
        label: 'Direction',
        presets: ['All', 'Classic', 'Alternate', 'Reverse'],
    })
    .addStringInput(filtersProxy, 'zoom', {
        label: 'Zoom',
        presets: ['All', 1, 2, 3],
    })
    .addStringInput(filtersProxy, 'cuts', {
        label: 'Cuts',
        presets: ['All', 0, 1, 2, 3, 4],
    })
    .addStringInput(filtersProxy, 'spacing', {
        label: 'Spacing',
        presets: ['All', 'Extra-thin', 'Thin', 'Normal', 'Large'],
    })
    .addStringInput(filtersProxy, 'curvyness', {
        label: 'Curvyness',
        presets: ['All', 0, 1, 2, 3, 4],
    })
    .addNumberInput(filtersProxy, 'palette', {
        label: 'Palette [0:All -> 55]',
        dp: 0,
    })
    .addStringInput(filtersProxy, 'complementaryColor', {
        label: 'Complementary Color',
        presets: ['All', 'Red','Deep Pink','Yellow','DodgerBlue','Purple'],
    })
    .addButton('Reset Filters', resetFilters)

document.querySelector('#controlKit').style.position = 'fixed'
document.querySelector('#controlKit>.panel').style.width = '250px'
document.querySelectorAll('#controlKit .panel .group-list .group .sub-group-list .sub-group .wrap .wrap').forEach(d => d.style.width = '50%')
document.querySelectorAll('#controlKit .panel .group-list .group .sub-group-list .sub-group .wrap .label').forEach(d => d.style.width = '50%')