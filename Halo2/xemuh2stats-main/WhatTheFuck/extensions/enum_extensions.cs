using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace WhatTheFuck.extensions
{
    public static class EnumExtensions
    {
        public static string GetDisplayName(this System.Enum enumValue)
        {
            var member = enumValue.GetType().GetMember(enumValue.ToString()).FirstOrDefault();
            if (member == null)
                return enumValue.ToString();

            var displayAttr = member.GetCustomAttribute<DisplayAttribute>();
            return displayAttr?.GetName() ?? enumValue.ToString();
        }
    }
}
