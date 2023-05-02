import { Action, Controller } from '@universal-packages/express-controllers'
import { ClassDecoratorFunction, MethodDecoratorFunction } from '@universal-packages/namespaced-decorators'
import { CURRENT_STORAGE } from './express-controllers-storage'
import { RouteName } from './types'

export function RegisterAction(route: RouteName): MethodDecoratorFunction {
  if (CURRENT_STORAGE.instance) {
    const routeConf = CURRENT_STORAGE.options.routes[route]

    if (routeConf.enable) {
      return Action(routeConf.method, routeConf.path)
    }
  }

  return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => descriptor
}

export function RegisterController(): ClassDecoratorFunction {
  if (CURRENT_STORAGE.instance) {
    return Controller(CURRENT_STORAGE.options.rootPath, {})
  }

  return (): void => {}
}
