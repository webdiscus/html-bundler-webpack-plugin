<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
  <#if section = "styles">
    <link rel="stylesheet" href="css/styles.69e2e9e9.css" />
  </#if>
  <#if section = "scripts">
    <script typo="module" src="js/main.5317c1f6.js"></script>
  </#if>
  <img src="img/picture.7b396424.png" />
</@layout.registrationLayout>
