import { DateUtils } from '../functions/routes/api/src/DateUtils';

function DateUtilsTestSuite() {
  alert(DateUtils.getDatesBetweenInclusive("2020-01-01", "2020-01-03"));
}

DateUtilsTestSuite();