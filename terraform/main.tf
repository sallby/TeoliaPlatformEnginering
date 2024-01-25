resource "azurerm_resource_group" "rg_name"{
    name = var.resource_group_name
    location = var.location
}