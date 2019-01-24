import {
  Rule,
  SchematicContext,
  Tree,
  externalSchematic,
  mergeWith,
  apply,
  url,
  move,
  chain,
  noop
} from '@angular-devkit/schematics'
import {
  addPackageJsonDependency,
  NodeDependency,
  NodeDependencyType
} from '@schematics/angular/utility/dependencies'
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks'

export default function(options: any): Rule {
  options.skipInstall = true

  return chain([
    (_tree: Tree, context: SchematicContext) => {
      !options.skipInstall ? context.addTask(new NodePackageInstallTask()) : noop()
    },
    externalSchematic('@schematics/angular', 'application', {
      name: 'ui-jar',
      skipInstall: options.skipInstall,
      minimal: true
    }),
    addUIJarDependency(),
    setupUIJarProject()
  ])
}

function addUIJarDependency(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const uijarDependency: NodeDependency = {
      name: 'ui-jar',
      version: '*',
      type: NodeDependencyType.Dev
    }
    addPackageJsonDependency(tree, uijarDependency)
  }
}

function setupUIJarProject(): Rule {
  return chain([updateTsConfig(), replaceFiles()])
}

function updateTsConfig(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const json = JSON.parse(tree.read('./projects/ui-jar/tsconfig.app.json')!.toString('utf-8'))

    json.exclude
      ? json.exclude.push('../../src/**/*.spec.ts')
      : (json.exclude = ['../../src/**/*.spec.ts'])

    json.include
      ? json.include.push(['**/*.ts', '../../src/**/*.ts'])
      : (json.include = ['**/*.ts', '../../src/**/*.ts'])

    tree.overwrite('./projects/ui-jar/tsconfig.app.json', JSON.stringify(json, null, 2))
  }
}

function replaceFiles(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    //TODO: Add the main.ts file
    tree.delete('./projects/ui-jar/src/index.html')
    mergeWith(apply(url('./files'), [move('./projects/ui-jar/src')]))
  }
}
