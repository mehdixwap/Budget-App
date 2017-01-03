// Budget Controller
var budgetController = (function() {
    
    var Expense = function(id, desc, value) {
        this.id = id;
        this.description= desc;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calculatePercentage = function(totalIncome) {
        if (totalIncome > 0) {
           this.percentage = Math.round((this.value / totalIncome)*100); 
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    };
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value; 
    };
    
    // data structure for all the income/expense
    var data = {
        allItems: {
            expense: [],
            income: []
        }, 
        totals: {
            expense: 0,
            income: 0
        }, 
        budget: 0,
        percentage: -1, 
        expensePercentages: []
    };
    
    var calculateTotal = function(type) {
        var sum = 0;
        
        data.allItems[type].forEach(function(cur) {
            sum += cur.value;
        });
        
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            // Set the ID
            if (data.allItems[type].length === 0) {
                ID = 0;
            } else {
                ID = data.allItems[type][(data.allItems[type].length - 1)].id + 1;
            }
            
            // Create new item for X type
            if (type === "expense") { 
                newItem = new Expense(ID, des, val);
            } else if (type === "income") {
                newItem = new Income(ID, des, val);
            }
            
            // Push into data structure
            data.allItems[type].push(newItem);

            // return new elements
            return newItem;
        },
        
        deleteItem: function(type, id) {
        
            var IDs, index;
            
            IDs = data.allItems[type].map( function(curr) {
                return curr.id;
            });
            
            index = IDs.indexOf(id);
            
            if (index !== -1) {
               data.allItems[type].splice(index, 1); 
            }
        },
        
        calculateBudget: function() {
              
            // calcualte total income and expense 
            calculateTotal("expense");
            calculateTotal("income");
            
            // calc total budget
            data.budget = data.totals.income - data.totals.expense;
            
            // calc the percentage of expense of total income
            if (data.totals.income > 0) {
                data.percentage = Math.round((data.totals.expense / data.totals.income)*100);
            } else {
                data.percentage = -1;
            }
            
            
            
        }, 
        
        calculatePercetages: function() {
            data.allItems.expense.forEach(function (curr) {
                curr.calculatePercentage(data.totals.expense);
            });
        },
        
        getPercentages: function() { 
            var allPercentages = data.allItems.expense.map(function(curr) {
                return curr.getPercentage(); 
            });
            return allPercentages; 
        },
        
        getBudget: function() {
            return {
                totalInc: data.totals.income,
                totalExp: data.totals.expense,
                budget: data.budget,
                percent: data.percentage
            }  
        },
        
        testing: function() {
            console.log(data);
        }
    }
    
        
})();

// UI Controller
var UIController = (function() {
    
    var DOMStrings = {
        inputType: ".add__type",
        inputDesc: ".add__description",
        inputValue: ".add__value",
        inputButton: ".add__btn",
        expenseContainer: ".expenses__list",
        incomeContainer: ".income__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel : ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container"
    }
    
    function getInputs() {
        return {
            type : document.querySelector(DOMStrings.inputType).value,
            desc : document.querySelector(DOMStrings.inputDesc).value,
            value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
        }
    }
    
    return {
        getInput: getInputs,
        
        addListItem: function(obj, type) {
            
            var html, newHTML, element;
            
            // Create HTML String with placeholder text
            if (type === "income") {
                element = DOMStrings.incomeContainer;
                html =  '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === "expense") {
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholdertext with some actual data
            newHTML = html.replace('%id%', obj.id);
            newHTML = newHTML.replace('%description%', obj.description);
            newHTML = newHTML.replace("%value%", obj.value);
            
            // Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHTML);
        },
        
        deleteListItem: function(selectorID) {
            var el =  document.getElementById(selectorID)
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMStrings.inputDesc + ", " + DOMStrings.inputValue);
            fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = "";
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {      
            document.querySelector(DOMStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = "+ " + obj.totalInc;
            document.querySelector(DOMStrings.expenseLabel).textContent = "- " + obj.totalExp;
            if (obj.percent > 0) {
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percent + " %";
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = "--";
            }
        },
        
        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(".item__percentage");
            
            var nodeListForEach = function(list, callback) {
                for (var i=0; i<list.length; i++) {
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(current, index) {
                
                console.log(percentages[index]);
                
                if (percentages[index] > 0) {
                   current.textContent = percentages[index] + "%"; 
                } else {
                    current.textContent = "---";
                }
            });
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    }
    
})();


var controller = (function(budgetCtrl, UICtrl) {

    var setUpEventListeners = function() {
        
        var DOMStrings = UICtrl.getDOMStrings();
        
        document.querySelector(DOMStrings.inputButton).addEventListener("click", ctrlAddItem);
    
        document.addEventListener("keypress", function(e) {
            if (e.keyCode === 13 || e.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOMStrings.container).addEventListener("click", ctrlDeleteItem);
    };
    
    var updateBudget = function() {
        // Calculate Budget
        budgetCtrl.calculateBudget();
        
        // Return budget
        var budget = budgetCtrl.getBudget();
        
        // Display the budget on the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        // Calculate percentages
        budgetCtrl.calculatePercetages();
        
        // read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        console.log(percentages);
        
        // update UI with new percentages
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function() {
        var inputs, newItem;
        
        // Get filled input data
        inputs = UICtrl.getInput();
        
        // Check the inputs for valid numbers
        if ( !isNaN(inputs.value) && inputs.desc !== "" && inputs.value > 0) {
            // Add item to budget controller
            newItem = budgetCtrl.addItem(inputs.type, inputs.desc, inputs.value);
            budgetCtrl.testing();

            // Add the item to the UI
            UICtrl.addListItem(newItem, inputs.type);

            // Clear the fields
            UICtrl.clearFields();
            
            // Calculate + Update Budget 
            updateBudget();
            updatePercentages();
        } else {
            alert("Please enter valid input");
            UICtrl.clearFields();
        }
        
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            
            splitID = itemID.split("-")
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // delete item from data strcutre
            budgetCtrl.deleteItem(type, ID);
            
            // delete item from the UI
            UICtrl.deleteListItem(itemID);
            
            // update/show budget
            updateBudget();
        }
    };

    return {
        init: function() {
            console.log("Applications has started");
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percent: -1
            });
            setUpEventListeners();
        }
    }
    
})(budgetController, UIController); 

controller.init();