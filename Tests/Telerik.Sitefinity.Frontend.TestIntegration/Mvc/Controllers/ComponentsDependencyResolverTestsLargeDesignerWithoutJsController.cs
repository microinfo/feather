﻿using System.Web.Mvc;
using Telerik.Sitefinity.Mvc;

namespace Telerik.Sitefinity.Frontend.TestIntegration.Mvc.Controllers
{
    [ControllerToolboxItem(Name = WidgetName, Title = WidgetName, SectionName = "Tests")]
    public class ComponentsDependencyResolverTestsLargeDesignerWithoutJsController : Controller
    {
        public ActionResult Index()
        {
            return this.Content(WidgetName);
        }

        public const string WidgetName = "ComponentsDependencyResolverTestsLargeDesignerWithoutJs";
    }
}