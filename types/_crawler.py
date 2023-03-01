import urllib.request, json, re

release = '11.01'

feed = 'https://schema.org/version/{}/schemaorg-all-https.jsonld'.format(release)

feed_response = urllib.request.urlopen(feed)

feed_text = feed_response.read().decode('utf-8')

graph = json.loads(feed_text)['@graph']

with open('_feed.json', 'w') as file:
    file.write(json.dumps(graph, sort_keys=True, indent=4))

with open('_template.html', 'r') as f:
    class_template = f.read()    
    
properties_list = [p for p in graph if (p.get('@type') and ((type(p['@type']) is str and p['@type'] == 'rdf:Property') or (type(p['@type']) is list and 'rdf:Property' in p['@type'])))]
properties = {}
for prop in properties_list:
    rdfslabel = prop['rdfs:label'] if type(prop['rdfs:label']) is str else (prop['rdfs:label'].get('@value') if type(prop['rdfs:label']) is dict else None)
    rdfscomment = prop['rdfs:comment'] if type(prop['rdfs:comment']) is str else (prop['rdfs:comment'].get('@value') if type(prop['rdfs:comment']) is dict else None)
    range_includes = prop.get('schema:rangeIncludes', [])
    range_includes = [range_includes] if range_includes and type(range_includes) is dict else range_includes
    properties[rdfslabel] = {
        'comment': rdfscomment, 
        'types': [r.get('@id') for r in range_includes], 
        'release': release
    }
    properties[rdfslabel]['types'] = [r for r in properties[rdfslabel]['types'] if r]
    properties[rdfslabel]['types'] = [r.split(':')[-1] for r in properties[rdfslabel]['types']]
    
    
for index, datatype in enumerate([d for d in graph if (
        (d.get('@type') and type(d['@type']) is str and d['@type'] == 'rdfs:Class') or 
        (d.get('@type') and type(d['@type']) is str and d['@type'] == 'schema:Boolean') or 
        (d.get('@type') and type(d['@type']) is list and 'rdfs:Class' in d['@type'])
    )]):
    print('{}: {}'.format(index, datatype.get('@id')))
    properties_list = [d['rdfs:label'] for d in graph 
            if (
                (d.get('@type') and ((type(d['@type']) is str and d['@type'] == 'rdf:Property') or (type(d['@type']) is list and 'rdf:Property' in d['@type']))) and 
                (d.get('schema:domainIncludes') and ((type(d['schema:domainIncludes']) is dict and d['schema:domainIncludes']['@id'] == datatype['@id']) or 
                    (type(d['schema:domainIncludes']) is list and datatype['@id'] in [dd.get('@id') for dd in d['schema:domainIncludes']]))) 
                )]
    properties_list = [p if type(p) is str else (p.get('@value') if type(p) is dict else None) for p in properties_list]
    properties_list = [p for p in properties_list if p]
    properties_list.sort()
    if datatype.get('@id') == 'schema:Collection':
        print(properties_list)
    subclassof = datatype['rdfs:subClassOf']['@id'].split(':')[-1] if datatype.get('rdfs:subClassOf') and type(datatype['rdfs:subClassOf']) is dict else (datatype['rdfs:subClassOf'][0]['@id'].split(':')[-1] if datatype.get('rdfs:subClassOf') and type(datatype['rdfs:subClassOf']) is list else None)
    _type = datatype['@type'] if datatype.get('@type') and type(datatype['@type']) is str else ('schema:DataType' if datatype.get('@type') and type(datatype['@type']) is list and 'schema:DataType' in datatype['@type'] else 'rdfs:Class')
    if subclassof is None:
        subclassof = 'DataType' if _type == 'schema:DataType' else  'Schema'
    rdfslabel = datatype['rdfs:label'] if type(datatype['rdfs:label']) is str else (datatype['rdfs:label'].get('@value') if type(datatype['rdfs:label']) is dict else None)
    rdfscomment = datatype['rdfs:comment'] if type(datatype['rdfs:comment']) is str else (datatype['rdfs:comment'].get('@value') if type(datatype['rdfs:comment']) is dict else None)
    if rdfslabel and rdfscomment:
        digits_map = {'0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four', '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'}
        properties_dict = {property_name: {'container': '$this', 'value': 'value', 'source': 'schema.org', 'propertyName': property_name, **properties.get(property_name, {})} for property_name in properties_list}
        for property_name, property_dict in properties_dict.items():
            property_dict['comment'] = property_dict.get('comment', '').replace('/', '\/')
        class_file_properties = {
            'release': release, 
            'rdfslabel_safe': rdfslabel.replace(rdfslabel[0], digits_map.get(rdfslabel[0], 'X'), 1) if rdfslabel[0].isnumeric() else rdfslabel, 
            'rdfssubclassof_id_safe_no_schemaprefix': subclassof.replace(subclassof[0], digits_map.get(subclassof[0], 'X'), 1) if subclassof[0].isnumeric() else subclassof, 
            '_id': datatype['@id'], 
            '_type': _type, 
            'rdfscomment': rdfscomment.replace('/', '\/').replace("'", "\\'").replace("\n", " "), 
            'rdfslabel': rdfslabel, 
            'properties_list_comma': json.dumps(properties_list)[1:-1].replace('"', "'"), 
            'properties_list_getters': '''
'''.join(['''
        {property_name}($this, value) {{\n\t\t\twindow.LiveElement.Schema.setProperty({property_map})\n\t\t\treturn value && typeof value == 'object' ? undefined : value\n\t\t}}'''.format(
                property_map=re.sub('"([^"]+)":', r"\1:", json.dumps(properties_dict.get(property_name, {}), sort_keys=True, indent="\t\t\t\t")).replace('"$this"', '$this').replace('"value"', 'value').replace("\n}", "\n\t\t\t}"), 
                property_name=property_name, 
                property_name_lower=property_name.lower()
            ).replace("\n};", "\n\t\t\t};").replace("\n\t\t\t\t\t\t\t\t", "\n\t\t\t\t\t") for property_name in properties_list])
        }
        class_file_text = class_template.format(**class_file_properties)
        with open('{}.html'.format(rdfslabel.lower()), 'w') as file:
            file.write(class_file_text)


#with open('properties.json', 'w') as file:
    #file.write(json.dumps(properties, sort_keys=True, indent=4))

