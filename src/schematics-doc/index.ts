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
  console.log(options)
  return chain([
    (_tree: Tree, context: SchematicContext) => {
      !options.skipInstall ? context.addTask(new NodePackageInstallTask()) : noop()
    },
    externalSchematic('@schematics/angular', 'application', {
      name: 'ui-jar',
      skipInstall: true,
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
  return chain([addScriptsToPackageJson(), updateTsConfig(), replaceFiles()])
}

function addScriptsToPackageJson(): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    const json = JSON.parse(tree.read('./package.json')!.toString('utf-8'))

    json.scripts = {
      ...json.scripts,
      'ui-jar': 'node node_modules/ui-jar/dist/bin/cli.js --directory ./src/app/ --includes \\.ts$',
      'start:ui-jar': 'npm run ui-jar && ng serve ui-jar'
    }

    tree.overwrite('./package.json', JSON.stringify(json, null, 2))
  }
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
    const files = [
      './projects/ui-jar/src/index.html',
      './projects/ui-jar/src/main.ts',
      './projects/ui-jar/src/styles.css'
    ]

    files.forEach(file => deleteFile(tree, file))

    return mergeWith(apply(url('./files'), [move('./projects/ui-jar/src')]))
  }
}

function deleteFile(tree: Tree, path: string): void {
  if (tree.exists(path)) tree.delete(path)
}
