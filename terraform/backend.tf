terraform {
  backend "azurerm" {
    resource_group_name  = "re-st-djiby"
    storage_account_name = "stdjiby"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
