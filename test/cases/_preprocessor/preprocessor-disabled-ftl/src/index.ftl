<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=true displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
  <#if section = "styles">
    <link rel="stylesheet" href="./scss/styles.scss" />
  </#if>
  <#if section = "scripts">
    <script typo="module" src="./js/main.js"></script>
  </#if>
  <img src="./images/picture.png" />
</@layout.registrationLayout>
