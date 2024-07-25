'use client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { LinkedUsersPage } from "@/components/Configuration/LinkedUsers/LinkedUsersPage";
import { Separator } from "@/components/ui/separator";
import FieldMappingsTable from "@/components/Configuration/FieldMappings/FieldMappingsTable";
import AddLinkedAccount from "@/components/Configuration/LinkedUsers/AddLinkedAccount";
import useLinkedUsers from "@/hooks/get/useLinkedUsers";
import useFieldMappings from "@/hooks/get/useFieldMappings";
import { useState } from "react";
import AddWebhook from "@/components/Configuration/Webhooks/AddWebhook";
import { WebhooksPage } from "@/components/Configuration/Webhooks/WebhooksPage";
import useWebhooks from "@/hooks/get/useWebhooks";
import useConnectionStrategies from "@/hooks/get/useConnectionStrategies";
import { Heading } from "@/components/ui/heading";
import CustomConnectorPage from "@/components/Configuration/Connector/CustomConnectorPage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CatalogWidget } from "@/components/Configuration/Catalog/CatalogWidget";
import { CopySnippet } from "@/components/Configuration/Catalog/CopySnippet";
import {Button as Button2} from "@/components/ui/button2"

export default function Page() {

  const { data: linkedUsers, isLoading, error } = useLinkedUsers();
  const { data: webhooks, isLoading: isWebhooksLoading, error: isWebhooksError } = useWebhooks();
  const { data: connectionStrategies, isLoading: isConnectionStrategiesLoading, error: isConnectionStategiesError} = useConnectionStrategies()
  const { data: mappings, isLoading: isFieldMappingsLoading, error: isFieldMappingsError } = useFieldMappings();

  const [open, setOpen] = useState(false);

  if(error){
    console.log("error linked users..");
  }

  if(isFieldMappingsLoading){
    console.log("loading FieldMappingsLoading..");
  }

  if(isFieldMappingsError){
    console.log("error isFieldMappingsError..");
  }

  if(isWebhooksLoading){
    console.log("loading webhooks..");
  }

  if(isWebhooksError){
    console.log("error fetching webhooks..");
  }

  if(isConnectionStrategiesLoading){
    console.log("loading Connection Strategies...");
  }

  if(isConnectionStategiesError){
    console.log("error Fetching connection Strategies!")
  }

  const mappingTs = mappings?.map(mapping => ({
    standard_object: mapping.ressource_owner_type,
    source_app: mapping.source,
    status: mapping.status,
    category: mapping.ressource_owner_type.split('.')[0], 
    source_field: mapping.remote_id, 
    destination_field: mapping.slug,
    data_type: mapping.data_type,
  }))
 
  return (
    
    <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <Heading
            title="Configuration"
            description=""
            />
          </div>
          <Tabs defaultValue="linked-accounts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="linked-accounts">Linked Accounts</TabsTrigger>
              <TabsTrigger value="field-mappings">
                Field Mapping
              </TabsTrigger>
              <TabsTrigger value="webhooks">
                Webhooks
              </TabsTrigger>
              <TabsTrigger value="catalog">
                Manage Catalog Widget
              </TabsTrigger>
              <TabsTrigger value="custom">
                Manage Connectors
              </TabsTrigger>
            </TabsList>
            <TabsContent value="linked-accounts" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <AddLinkedAccount/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left flex items-center">
                      <span>Your Linked Accounts</span>
                      <TooltipProvider>  
                        <Tooltip>
                          <Popover>
                            <PopoverTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button variant={"link"} size="icon">
                                  <HelpCircle className="h-4 w-4" />
                                  <span className="sr-only">Help</span>
                                </Button>
                              </TooltipTrigger>
                            </PopoverTrigger>
                            <PopoverContent className="flex w-[420px] p-0">
                              <div className="flex flex-col gap-2 px-2 py-4">
                                <div className="grid min-w-[250px] gap-1 gap-y-2">
                                  <p className="font-bold text-md">What are linked accounts ? </p>
                                  <p className="text-sm">The linked-user object represents your end-user entity inside our system.</p>
                                  <p className="text-sm">It is a mirror of the end-user that exist in your backend. It helps Panora have the same source of truth about your user’s information. </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <TooltipContent>Help</TooltipContent>
                        </Tooltip>     
                      </TooltipProvider>  
                    </CardTitle>
                    <CardDescription className="text-left flex flex-row items-center">
                      You connected {linkedUsers ? linkedUsers.length : <LoadingSpinner className="w-4 mr-2"/>} linked accounts.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <LinkedUsersPage linkedUsers={linkedUsers} isLoading={isLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="field-mappings" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left flex items-center">
                      <span>Your Fields Mappings</span>
                      <TooltipProvider>  
                        <Tooltip>
                          <Popover>
                            <PopoverTrigger asChild>
                              <TooltipTrigger asChild>
                                <Button variant={"link"} size="icon">
                                  <HelpCircle className="h-4 w-4" />
                                  <span className="sr-only">Help</span>
                                </Button>
                              </TooltipTrigger>
                            </PopoverTrigger>
                            <PopoverContent className="flex w-[420px] p-0">
                              <div className="flex flex-col gap-2 px-2 py-4">
                                <div className="grid min-w-[250px] gap-1 gap-y-2 ">
                                  <p className="font-bold text-md">What are field mappings ? </p>
                                  <p className="text-sm">
                                    By default, our unified models are predefined as you can see in the API reference. <br/>
                                  </p>
                                  <p className="text-sm">Now with field mappings, you have the option to map your custom fields (that may exist in your end-customer&apos;s tools) to our unified model !</p>
                                  <p className="text-sm">
                                    It is done in 2 steps. First you must define your custom field so it is recognized by Panora. Lastly, you must map this field to your remote field that exist in a 3rd party.
                                  </p>
                                  <p className="text-sm">
                                  <br/>That way, Panora can retrieve the newly created custom field directly within the unified model.
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                          <TooltipContent>Help</TooltipContent>
                        </Tooltip>     
                      </TooltipProvider>                
                    </CardTitle>
                    <CardDescription className="text-left flex flex-row items-center">
                      You built {mappings ? mappings.length : <LoadingSpinner className="w-4 mr-1"/>} fields mappings.
                      <Button2 variant="linkHover2">
                        <a href="https://docs.panora.dev/core-concepts/custom-fields" className="font-bold" target="_blank" rel="noopener noreferrer"> Learn more about custom field mappings in our docs !</a>
                      </Button2>
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-7"/>
                  <CardContent>
                    <FieldMappingsTable mappings={mappingTs} isLoading={isFieldMappingsLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <AddWebhook/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Your Webhooks</CardTitle>
                    <CardDescription className="text-left flex flex-row items-center">
                      You enabled {webhooks ? webhooks.length : <LoadingSpinner className="w-4 mr-1"/>} webhooks.
                      <Button2 variant="linkHover2">
                        <a href="https://docs.panora.dev/webhooks/overview" target="_blank" rel="noopener noreferrer"><strong> Read more about webhooks from our documentation</strong></a>
                      </Button2>
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-10"/>
                  <CardContent>
                    <WebhooksPage webhooks={webhooks} isLoading={isWebhooksLoading} />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <CustomConnectorPage />
            </TabsContent>

            <TabsContent value="catalog" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
                <CopySnippet/>
                <Card className="col-span-12">
                  <CardHeader>
                    <CardTitle className="text-left">Customize Your Embedded Widget</CardTitle>
                    <CardDescription className="text-left flex flex-row items-center">
                      Select connectors you would like to have in the UI widget catalog. By default, they are all displayed.
                    </CardDescription>
                  </CardHeader>
                  <Separator className="mb-[15px]"/>
                  <CardContent>
                    <CatalogWidget/>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

      </div>
  );
  }