provider "azurerm" {
  features {
    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
  skip_provider_registration = true
}

data "azurerm_policy_definition" "location_policy" {
  display_name = "Allowed locations"
}
module "rg" {
  source       = "./modules/resource_group"
  nomRessource = var.nomRessource
  localisation = var.localisation
}

resource "azurerm_resource_group_policy_assignment" "location_policy" {
  name                 = "location-policy"
  resource_group_id    = module.rg.resource_group_id
  policy_definition_id = data.azurerm_policy_definition.location_policy.id
}
