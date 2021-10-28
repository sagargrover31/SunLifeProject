import { LightningElement, wire } from 'lwc';
import fetchAccounts from '@salesforce/apex/AccountController.fetchAccounts';
import updateAccounts from '@salesforce/apex/AccountController.updateAccounts';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
  {
        label: 'Account Name',
        fieldName: 'AccName',
        sortable: true,
        type: 'url',
        typeAttributes: {label: { fieldName: 'Name' }, target: '_blank'}
    }, 
    {
        label: 'Account Owner',
        fieldName: 'AccountOwner',
        sortable: true,
        type: 'text'
    }, 
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Website', fieldName: 'Website', type: 'text' , editable: true},
    { label: 'AnnualRevenue', fieldName: 'AnnualRevenue', type: 'currency' , editable: true}

];

export default class financialserviceclass extends LightningElement {

    records;
    wiredRecords;
    error;
    columns = columns;
    draftValues = [];
    sortedBy;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    
    connectedCallback(){
        const searchKey = '';
        this.fetchValues(searchKey);
    } 
    handleKeyChange( event ) {
        const searchKey = event.target.value;
        this.fetchValues(searchKey);
    }
    fetchValues(searchKey) {
        fetchAccounts( { searchKey } )   
            .then(result => {
                let tempConList = []; 
                result.forEach((record) => {
                let tempConRec = Object.assign({}, record);  
                tempConRec.AccName = '/' + tempConRec.Id;
                tempConRec.AccountOwner = tempConRec.Owner.Name;
                tempConList.push(tempConRec);
            });
            this.records = tempConList;
            this.error = undefined;
            })
            .catch(error => {
                this.error = error;
            });
    }
    async handleSave( event ) {
        const updatedFields = event.detail.draftValues;
        await updateAccounts( { data: updatedFields } )
        .then( result => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account(s) updated',
                    variant: 'success'
                })
            );
            
            refreshApex( this.wiredRecords ).then( () => {
                this.draftValues = [];
            });        

        }).catch( error => {
            console.log( 'Error is ' + JSON.stringify( error ) );
        });

    }
    onHandleSort( event ) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.records];

        cloneData.sort( this.sortBy( sortedBy, sortDirection === 'asc' ? 1 : -1 ) );
        this.records = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;

    }

    sortBy( field, reverse, primer ) {
        const key = primer
            ? function( x ) {
                  return primer(x[field]);
              }
            : function( x ) {
                  return x[field];
              };

        return function( a, b ) {
            a = key(a);
            b = key(b);
            return reverse * ( ( a > b ) - ( b > a ) );
        };
    }
}