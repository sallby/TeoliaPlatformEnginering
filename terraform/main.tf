provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  skip_provider_registration = true
}

module "rg" {
  source       = "./modules/resource_group"
  nomRessource = var.nomRessource
  localisation = var.localisation
}

#resource "azurerm_policy_assignment" "location_policy" {
#  name                 = "location-policy"
#  scope                = module.rg.resource_group_id
#  policy_definition_id = "/providers/Microsoft.Authorization/policyDefinitions/01be5988-e43e-45f8-a060-172570bc6981"
#}
