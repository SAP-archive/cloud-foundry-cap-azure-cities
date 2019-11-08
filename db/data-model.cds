namespace my.persistence;

using {
  managed,
  cuid
} from '@sap/cds/common';

entity Cities : managed, cuid {
  ImageUrl    : String;
  Name        : String;
  State       : String;
  Region      : String;
  Country     : String;
  Area        : DecimalFloat;
  Elevation   : DecimalFloat;
  Population  : Integer;
  PostalCodes : String;
  DialCodes   : String;
}