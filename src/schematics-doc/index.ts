import { Rule, SchematicContext, Tree, externalSchematic } from '@angular-devkit/schematics'
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies'
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks'

export function addUIJarDependency(): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const uijarDependency: NodeDependency = {
      name: 'ui-jar',
      version: '*',
      type: NodeDependencyType.Dev
    }
    addPackageJsonDependency(tree, uijarDependency)

    if (0) context.addTask(new NodePackageInstallTask())
  }
}

export function generateUIJarProject(): Rule {
  return externalSchematic('@schematics/angular', 'application', {
    name: 'app-test',
    skipInstall: true,
    minimal: true
  })
}

export function setupUIJarProject(): Rule {
  return (_tree: Tree, _context: SchematicContext) => {
    console.log('coucou')
  }
}

export default function schematicsDoc(_options: any): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    context.addTask(new RunSchematicTask('add-uijar-dependency', {}))

    // const installTaskId = context.addTask(new RunSchematicTask('add-uijar-dependency', {}))

    // const projectCreationTaskId = context.addTask(new RunSchematicTask('generate-uijar-app', {}), [
    //   installTaskId
    // ])

    // context.addTask(new RunSchematicTask('setup-uijar-app', {}), [projectCreationTaskId])
  }
}
