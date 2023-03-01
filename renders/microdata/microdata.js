window.LiveElement.Schema.Validators = {...window.LiveElement.Schema.Validators, ...{
    
}}

window.LiveElement.Schema.ValidatorMap = {...window.LiveElement.Schema.ValidatorMap, ...{
    
}}

window.LiveElement.Schema.ClassMap = {...window.LiveElement.Schema.ClassMap, ...{
    
}}

window.LiveElement.Schema.Renders = {...window.LiveElement.Schema.Renders, ...{
    schema: (element, asClass, style, template) => {
        if (!element.__propertyMap) {
            if (element.__isConnected && !element.hasAttribute('itemscope')) {
                element.setAttribute('itemscope', '')
            }
            if (element.__isConnected && !element.hasAttribute('itemtype')) {
                element.setAttribute('itemtype', `${element.constructor.__context}${element.constructor._rdfs_label}`)
            }
        }
    }, 
    scalar: (element, asClass, style, template) => {
        if ([undefined, null].includes(element.__input)) {
            element.innerText = ''
        } else if (element.__input != element.innerText) {
            element.innerText = element.__input
        }
        if ([undefined, null].includes(element.__value)) {
            element.removeAttribute('content')
        } else if (element.__value != element.innerText) {
            element.setAttribute('content', element.__value)
        } else {
            element.removeAttribute('content')
        }
        window.LiveElement.Schema.Renders.schema(element, asClass, style, template)
    }, 
    time: {
        renderFunction: (element, asClass, style, template) => {
            window.LiveElement.Schema.Renders.scalar(element, asClass, style, template)
            if (!element.__isConnected) {
                var observer = new window.MutationObserver(record => { 
                    var contentValue = element.getAttribute('content')
                    if (contentValue != element.getAttribute('datetime')) {
                        element.setAttribute('datetime', contentValue)
                    }
                })
                observer.observe(element, {attributeFilter: ['content']})
            }
        }
    }, 
    object: (element, asClass, style, template) => {
        if (element.__isConnected && element.__map && typeof element.__map == 'object') {
            window.LiveElement.Schema.Renders.schema(element, asClass, style, template)
            Object.keys(element.__map).forEach(attributeName => {
                if (element.__map[attributeName] && typeof element.__map[attributeName].setAttribute == 'function') {
                    var attributeElement = element.shadowRoot.querySelector(`[itemprop="${attributeName}"]`)
                    if (!element.__map[attributeName].getAttribute('itemprop') != attributeName) {
                        element.__map[attributeName].setAttribute('itemprop', attributeName)
                    }
                    if (!attributeElement) {
                        element.shadowRoot.append(element.__map[attributeName])
                        window.LiveElement.Schema.runRender(element.__map[attributeName])
                    } else {
                        attributeElement.replaceWith(element.__map[attributeName])
                        window.LiveElement.Schema.runRender(element.__map[attributeName])
                    }
                }
            })
            
        }
    }
}}

window.LiveElement.Schema.RenderMap = {...window.LiveElement.Schema.RenderMap, ...{
    Text: 'scalar', 
    URL: 'scalar', 
    CssSelectorType: 'scalar', 
    XPathType: 'scalar', 
    Number: 'scalar', 
    Float: 'scalar', 
    Integer: 'scalar', 
    Time: 'time', 
    Date: 'time', 
    DateTime: 'time', 
    Boolean: 'scalar', 
    False: 'scalar', 
    True: 'scalar', 
    Thing: 'object'
}}

window.LiveElement.Schema.Errors = {...window.LiveElement.Schema.Errors, ...{
    
}}

window.LiveElement.Schema.Options = {...window.LiveElement.Schema.Options, ...{
    True: ['True', 'Yes'], 
    False: ['False', 'No'], 
    DefaultURLProtocol: 'https'
}}
