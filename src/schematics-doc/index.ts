import {
  Rule,
  SchematicContext,
  Tree,
  externalSchematic,
  mergeWith,
  apply,
  url,
  move
} from '@angular-devkit/schematics'
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies'
// import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks'
import { RunSchematicTask, NodePackageInstallTask } from '@angular-devkit/schematics/tasks'

/////////////////////// https://github.com/briebug/jest-schematic

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
    name: 'ui-jar',
    skipInstall: true,
    minimal: true
  })
}

export function setupUIJarProject(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const json = JSON.parse(tree.read('./projects/ui-jar/tsconfig.app.json')!.toString('utf-8'))

    json.exclude
      ? json.exclude.push('../../src/**/*.spec.ts')
      : (json.exclude = ['../../src/**/*.spec.ts'])

    json.include
      ? json.include.push(['**/*.ts', '../../src/**/*.ts'])
      : (json.include = ['**/*.ts', '../../src/**/*.ts'])

    tree.overwrite('./projects/ui-jar/tsconfig.app.json', JSON.stringify(json, null, 2))

    tree.delete('./projects/ui-jar/src/index.html')

    return mergeWith(apply(url('./files'), [move('./projects/ui-jar/src')]))
  }
}

export default function(_options: any): Rule {
  return (_tree: Tree, context: SchematicContext) => {
    const installTaskId = context.addTask(new RunSchematicTask('add-uijar-dependency', {}))
    const projectCreationTaskId = context.addTask(new RunSchematicTask('generate-uijar-app', {}), [
      installTaskId
    ])
    context.addTask(new RunSchematicTask('setup-uijar-app', {}), [projectCreationTaskId])
  }
}
