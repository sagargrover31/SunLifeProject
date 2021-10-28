public with sharing class AccountController {
    @AuraEnabled
    public static string updateAccounts(Object data) {
        List<Account> accountsForUpdate = (List<Account>) JSON.deserialize(
            JSON.serialize(data),
            List<Account>.class
        );
        try {
            update accountsForUpdate;
            return 'Success: Account updated successfully';
        }
        catch (Exception e) {
            return 'The following exception has occurred: ' + e.getMessage();
        }
    }
}