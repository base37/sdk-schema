window.LiveElement = window.LiveElement || {}
window.LiveElement.Schema = window.LiveElement.Schema || Object.defineProperties({}, {
    version: {configurable: false, enumerable: true, writable: false, value: '1.0.0'}, 
    CoreTypes: {configurable: false, enumerable: true, writable: true, value: ['Thing', 'Intangible', 'Class', 'DataType', 'PronounceableText']}, 
    DataTypes: {configurable: false, enumerable: true, writable: true, value: ['Text', 'True', 'False', 'Boolean', 'DateTime', 'Date', 'Time', 'Integer', 'Float', 'Number', 'XPathType', 'CssSelectorType', 'URL']}, 
    Options: {configurable: false, enumerable: true, writable: true, value: {}}, 
    _backFillClassMap: {configurable: false, enumerable: false, writable: false, value: function(element) {
        if (!window.LiveElement.Schema._ClassMapBackFilled) {
            window.LiveElement.Schema.CoreTypes.concat(window.LiveElement.Schema.DataTypes).forEach(t => window.LiveElement.Schema.ClassMap[t] = window.LiveElement.Schema.ClassMap[t] || t)
            window.LiveElement.Schema._ClassMapBackFilled = true
        }
        if (Object.keys(window.LiveElement.Schema.ClassMap).length < Object.keys(window.LiveElement.Element.tags).length) {
            Object.keys(window.LiveElement.Element.tags).forEach(t => window.LiveElement.Schema.ClassMap[t] = window.LiveElement.Schema.ClassMap[t] || t)
        }
    }}, 
    _parseMap: {configurable: false, enumerable: false, writable: false, value: function(mapObject, ownPropertyName, containerInheritance, propertyMap){
        var t
        var target
        if (containerInheritance && containerInheritance.some(containerClassName => {
            t = containerClassName
            return mapObject[containerClassName] && typeof mapObject[containerClassName] == 'object' && mapObject[containerClassName][ownPropertyName]
        })) {
            // this propertyName can be found as a propertyName in any ancestor container class
            target = mapObject[t][ownPropertyName]
        } else if (containerInheritance && propertyMap && propertyMap.types && propertyMap.types.length == 1) {
            propertyMap.types.some(ot => {
                return containerInheritance.some(ct => {
                    if (mapObject[ct] && typeof mapObject[ct] == 'object' && mapObject[ct][ot]) {
                        // one of the types can be found in any ancestor container class
                        target = mapObject[ct][ot]
                        return true
                    }
                })
            })
        }
        if (!target && mapObject[ownPropertyName]) {
            // the propertyName is directly under the root
            target = mapObject[ownPropertyName]
        } else if (!target  && propertyMap && propertyMap.types && propertyMap.types.some(ot => { 
            t = ot
            return mapObject[ot]
        })) {
            // one of the types is directly under the root
            target = mapObject[t]
        }
        return target
    }}, 
    _getValidator: {configurable: false, enumerable: false, writable: false, value: function(ownPropertyName, containerInheritance, propertyMap){
        var validatorName = window.LiveElement.Schema._parseMap(window.LiveElement.Schema.ValidatorMap, ownPropertyName, containerInheritance, propertyMap)
        validatorName = validatorName || window.LiveElement.Schema._parseMap(window.LiveElement.Schema.Validators, ownPropertyName, containerInheritance, propertyMap)
        if (typeof validatorName == 'function') {
            return validatorName
        } else if (typeof validatorName == 'string' && window.LiveElement.Schema.Validators[validatorName]) {
            return window.LiveElement.Schema.Validators[validatorName]
        } else {
            return window.LiveElement.Schema.Validators.Schema
        }
    }}, 
    _getClass: {configurable: false, enumerable: false, writable: false, value: function(ownPropertyName, containerInheritance, propertyMap){
        var className = window.LiveElement.Schema._parseMap(window.LiveElement.Schema.ClassMap, ownPropertyName, containerInheritance, propertyMap)
        return className || 'Schema'
    }}, 
    _getRender: {configurable: false, enumerable: false, writable: false, value: function(ownPropertyName, containerInheritance, propertyMap){
        var renderName = window.LiveElement.Schema._parseMap(window.LiveElement.Schema.RenderMap, ownPropertyName, containerInheritance, propertyMap)
        renderName = renderName || window.LiveElement.Schema._parseMap(window.LiveElement.Schema.Renders, ownPropertyName, containerInheritance, propertyMap)
        if (typeof renderName == 'function' || typeof renderName == 'object') {
            return renderName
        } else if (typeof renderName == 'string' && window.LiveElement.Schema.Renders[renderName]) {
            return window.LiveElement.Schema.Renders[renderName]
        } else if (typeof renderName == 'string' && window.LiveElement.Element.elements[renderName] && typeof window.LiveElement.Element.elements[renderName].__render == 'function') {
            return {asClass: renderName}
        }
    }}, 
    _getError: {configurable: false, enumerable: false, writable: false, value: function(ownPropertyName, containerInheritance, propertyMap){
        return window.LiveElement.Schema._parseMap(window.LiveElement.Schema.Errors, ownPropertyName, containerInheritance, propertyMap)
    }}, 
    Validators: {configurable: false, enumerable: true, writable: true, value: Object.defineProperties({}, {
            True: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                if (window.LiveElement.Schema.Options.True && typeof window.LiveElement.Schema.Options.True == 'object' && window.LiveElement.Schema.Options.True.constructor.name == 'Array') {
                    result.valid =  window.LiveElement.Schema.Options.True.map(v => v.toLowerCase()).includes(String(input).toLowerCase())
                } else {
                    result.valid = true
                }
                result.value = result.valid ? true : undefined
                if (!result.valid) {
                    result.error = `True values with an allow list must have an input matching an option in the allow list`
                }
                return result
            }}, 
            False: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                if (window.LiveElement.Schema.Options.False && typeof window.LiveElement.Schema.Options.False == 'object' && window.LiveElement.Schema.Options.False.constructor.name == 'Array') {
                    result.valid =  window.LiveElement.Schema.Options.False.map(v => v.toLowerCase()).includes(String(input).toLowerCase())
                } else {
                    result.valid = true
                }
                result.value = result.valid ? false : undefined
                if (!result.valid) {
                    result.error = `False values with an allow list must have an input matching an option in the allow list`
                }
                return result
            }}, 
            Boolean: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var trueList = window.LiveElement.Schema.Options.True || []
                var falseList = window.LiveElement.Schema.Options.False || []
                var allowList = trueList.concat(falseList)
                result.valid = allowList.length ? allowList.includes(input) : true
                result.value = allowList.length && result.valid ? trueList.includes(input) : !!input
                if (!result.valid) {
                    result.error = `Boolean values with an allow list must have an input matching an option in the allow list`
                }
                return result
            }}, 
            DateTime: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var checkDateTimestamp = Date.parse(String(input).trim())
                var checkDate = checkDateTimestamp ? (new Date(checkDateTimestamp)) : undefined
                if (checkDate) {
                    result.valid = true
                    result.value = checkDate.toISOString()
                } else {
                    result.valid = false
                    result.value = undefined
                    result.error = `DateTime input must be a parseable datetime string`
                }
                return result
            }}, 
            Date: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var checkDateTimestamp = Date.parse(`${String(input).trim()}  00:00:00`)
                var checkDate = checkDateTimestamp ? (new Date(checkDateTimestamp)) : undefined
                if (checkDate) {
                    result.valid = true
                    result.value = checkDate.toISOString().split('T').shift()
                } else {
                    result.valid = false
                    result.value = undefined
                    result.error = `Date input must be a parseable date string`
                }
                return result
            }}, 
            Time: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var checkDateTimestamp = Date.parse(`2000-01-01 ${String(input).trim()}`)
                var checkDate = checkDateTimestamp ? (new Date(checkDateTimestamp)) : undefined
                if (checkDate) {
                    result.valid = true
                    result.value = checkDate.toTimeString()
                } else {
                    result.valid = false
                    result.value = undefined
                    result.error = `Time input must be a parseable time string`
                }
                return result
            }}, 
            Integer: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var floatVal = parseFloat(input)
                var intVal = parseInt(input, 10)
                result.valid = !Number.isNaN(floatVal) && (intVal == floatVal)
                if (result.valid) {
                    result.value = intVal
                } else {
                    result.error = `Integer input must be able to be cast to a Integer without a change in value`
                }
                return result
            }}, 
            Float: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var floatVal = parseFloat(input)
                result.valid = !Number.isNaN(floatVal)
                if (result.valid) {
                    result.value = floatVal
                } else {
                    result.error = `Float input must be able to be cast to a Float`
                }
                return result
            }}, 
            Number: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                result.valid = !window.Number.isNaN(window.Number(input))
                if (result.valid) {
                    result.value = Number(input)
                }
                if (!result.valid) {
                    result.error = `Number input must be a valid number`
                }
                return result
            }}, 
            XPathType: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                result.value = input ? String(input) : ''
                result.valid = typeof result.value == 'string'
                if (!result.valid) {
                    result.error = `XPathType input must be strings not ${typeof input}`
                }
                return result
            }}, 
            CssSelectorType: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                result.value = input ? String(input) : ''
                result.valid = typeof result.value == 'string'
                if (!result.valid) {
                    result.error = `CssSelectorType input must be strings not ${typeof input}`
                }
                return result
            }}, 
            URL: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                var checkElement = document.createElement('input')
                checkElement.setAttribute('type', 'url')
                checkElement.value = String(input)
                result.valid = checkElement.reportValidity()
                result.value = result.valid ? checkElement.value : ( checkElement.value.indexOf('://') == -1 ? `${window.LiveElement.Schema.Options.DefaultURLProtocol || 'https'}://${checkElement.value}` : undefined)
                if (!result.valid) {
                    result.error = `URL input should be a valid url`
                }
                return result
            }}, 
            Text: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                var result = window.LiveElement.Schema.Validators.Schema(input, propertyMap)
                result.value = input ? String(input) : ''
                result.valid = typeof result.value == 'string'
                if (!result.valid) {
                    result.error = `Text input must be strings not ${typeof input}`
                }
                return result
            }},         
            Schema: {configurable: false, enumerable: true, writable: false, value: function(input, propertyMap={}) {
                return {input: input, value: input, valid: true, error: undefined}
            }}
        })
    }, 
    ValidatorMap: {configurable: false, enumerable: true, writable: true, value: {}}, 
    ClassMap: {configurable: false, enumerable: true, writable: true, value: {}}, 
    Renders: {configurable: false, enumerable: true, writable: true, value: {}}, 
    RenderMap: {configurable: false, enumerable: true, writable: true, value: {}}, 
    Errors: {configurable: false, enumerable: true, writable: true, value: Object.defineProperties({}, {
            Schema: {configurable: false, enumerable: true, writable: false, value: function(value) {
                return true
            }}
        })
    }, 
    setElementInput: {configurable: false, enumerable: true, writable: false, value: function(element, input, propertyMap=undefined, containerInheritance=undefined) {
        window.LiveElement.Schema._backFillClassMap()
        propertyMap = propertyMap || element.__propertyMap
        if (!containerInheritance && propertyMap && typeof propertyMap == 'object' && propertyMap.container) {
            containerInheritance = window.LiveElement.Element.getInheritance(propertyMap.container.constructor)            
        }
        var validator = containerInheritance && propertyMap 
            ? window.LiveElement.Schema._getValidator(propertyMap.propertyName, containerInheritance, propertyMap) 
            : window.LiveElement.Schema._getValidator(element.constructor._rdfs_label)
        element.__input = input 
        if (element.__input && typeof element.__input == 'object') {
            element.__validation = Object.assign({}, ...Object.entries(element.__map).map(entry => ({[entry[0]]: entry[1].__validation})))
            element.__value = Object.assign({}, ...Object.entries(element.__map).map(entry => ({[entry[0]]: entry[1].__value})))
        } else {
            element.__validation = validator && typeof validator == 'function' ? {...(element.__validation || {}), ...validator(input, propertyMap)} : element.__validation
            element.__value = typeof element.__validation == 'object' ? element.__validation.value : undefined 
        }
        if (element.__input && typeof element.__input == 'object') {
            Object.keys(element.__input).forEach(propertyName => {
                var propertyNameLower = propertyName.toLowerCase()
                if (element.__input[propertyName] && typeof element.__input[propertyName] != 'object' && (element.getAttribute(propertyNameLower) != element.__input[propertyName])) {
                    element.setAttribute(propertyNameLower, element.__input[propertyName])
                } else if ((element[propertyName] != element.__input[propertyName]) && (element.__input[propertyName] === null || element.__input[propertyName] == undefined || typeof element.__input[propertyName] != 'object')) {
                    element.removeAttribute(propertyNameLower)
                    element[propertyName] = element.__input[propertyName]
                }
            })
        }
        element.dispatchEvent(new window.CustomEvent('schema-input'))
        window.LiveElement.Schema.runRender(element)
    }}, 
    setProperty: {configurable: false, enumerable: true, writable: false, value: function(propertyMap) {
        if (propertyMap && typeof propertyMap == 'object' && typeof propertyMap.container == 'object' && propertyMap.container.constructor._rdfs_label && typeof propertyMap.types == 'object' && typeof propertyMap.types.some == 'function') {
            window.LiveElement.Schema._backFillClassMap()
            var containerInheritance = window.LiveElement.Element.getInheritance(propertyMap.container.constructor)
            var renderClass = window.LiveElement.Schema._getClass(propertyMap.propertyName, containerInheritance, propertyMap)
            var propertyTag = window.LiveElement.Element.tags[renderClass] || `${window.LiveElement.Element.prefix}-${renderClass}`.toLowerCase()
            window.customElements.whenDefined(propertyTag).then(() => {
                var propertyElement = document.createElement(propertyTag)
                propertyElement.__propertyMap = propertyMap
                if (propertyMap && typeof propertyMap == 'object' && propertyMap.container) {
                    propertyElement.__container = propertyMap.container
                    propertyElement.__containerPropertyName = propertyMap.propertyName
                    propertyElement.__container.__map[propertyElement.__containerPropertyName] = propertyElement
                    propertyElement.addEventListener('schema-input', event => {
                        window.LiveElement.Schema.setElementInput(propertyElement.__container, Object.assign({}, ...Object.entries(propertyElement.__container.__map).map(entry => ({[entry[0]]: entry[1].__input}))))
                    })
                }
                window.LiveElement.Schema.setElementInput(propertyElement, propertyMap.value, propertyMap, containerInheritance)
            })
        }
    }}, 
    runRender: {configurable: false, enumerable: true, writable: false, value: function(element) {
        var render
        window.LiveElement.Schema._backFillClassMap()
        if (element.__container && element.__containerPropertyName && element.__propertyMap) {
            render = window.LiveElement.Schema._getRender(element.__containerPropertyName, window.LiveElement.Element.getInheritance(element.__container.constructor), element.__propertyMap)
        } else {
            render = window.LiveElement.Schema._getRender(element.constructor._rdfs_label)
        }
        if (typeof render == 'function') {
            render(element)
        } else if (render && typeof render == 'object') {
            window.LiveElement.Element.render(element, render.asClass, render.renderFunction, render.style, render.template)
        }
    }}
})
