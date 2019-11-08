using my.persistence as my from '../db/data-model';

service CatalogService {
    @Capabilities : {
        Insertable : true,
        Updatable  : true,
        Deletable  : false
    }
    entity Cities as projection on my.Cities;

    annotate Cities with @odata.draft.enabled;
}