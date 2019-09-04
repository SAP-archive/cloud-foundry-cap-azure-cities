using from './cat-service';


annotate CatalogService.Cities with {
    ID @title:'{i18n>ID}' @UI.HiddenFilter;
    Name @title:'{i18n>Name}';
    State @title:'{i18n>State}';
    Region @title:'{i18n>Region}';
    Country @title:'{i18n>Country}';
    Area @title:'{i18n>Area}';
    Elevation @title:'{i18n>Elevation}';
    PostalCodes @title:'{i18n>Postal}';
    DialCodes @title:'{i18n>Dial}';
    Population @title:'{i18n>Population}';
}

annotate CatalogService.Cities with @(
    UI: {
        Identification: [ {Value: ID} ],
        SelectionFields: [Name, Region, State, Country],
        LineItem: [
            {Value: Name},
            {Value: Region},
            {Value: State},
            {Value: Country},
            {Value: Elevation}
        ],
        HeaderInfo: {
            TypeName: '{i18n>City}',
            TypeNamePlural: '{i18n>Cities}',
            Title: {Value: Name},
            ImageUrl: ImageUrl,
            Description: {Value: Country}
        },
    		HeaderFacets: [
            {$Type: 'UI.ReferenceFacet', Label: '{i18n>General}', Target: '@UI.FieldGroup#General'},
          ],
    		FieldGroup#General: {
    			Data: [
            {$Type: 'UI.DataField', Value: Elevation},
    				{$Type: 'UI.DataField', Value: Population},
    				{$Type: 'UI.DataField', Value: State},
    			]
    		},    		
        Facets: [
          {
            $Type: 'UI.CollectionFacet',
            ID: 'AdminDetails',
            Facets: [
              {$Type: 'UI.ReferenceFacet', Label: '{i18n>Geo}', Target: '@UI.FieldGroup#Geo'},
              {$Type: 'UI.ReferenceFacet', Label: '{i18n>Communication}', Target: '@UI.FieldGroup#Communication'},
              {$Type: 'UI.ReferenceFacet', Label: '{i18n>Admin}', Target: '@UI.FieldGroup#AdministrativeData'},
            ],
            Label: '{i18n>Additional}'
          }
        ],
        FieldGroup#Geo: {
    			Label: '{i18n>Geo}',
    			Data: [
    				{ Value: Area},
    				{ Value: Elevation},
    			]
    		},
        FieldGroup#Communication: {
          Label: '{i18n>Communication}',
          Data: [
            { Value: PostalCodes},
            { Value: DialCodes}
          ]
        },
        FieldGroup#AdministrativeData: {
          Label: '{i18n>Admin}',
          Data: [
            { Value: createdBy },
            { Value: createdAt },
            { Value: modifiedBy },
            { Value: modifiedAt },
            { Value: ImageUrl }
          ]
        }
      }
);