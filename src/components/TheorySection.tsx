import React from 'react';
import { motion } from 'motion/react';

export const TheorySection: React.FC = () => {
  return (
    <div className="space-y-6 text-slate-800">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
      >
        <h2 className="text-2xl font-bold mb-4 text-slate-900">Физика процесса: LFP на морозе</h2>
        <p className="mb-4 leading-relaxed">
          Это абсолютно точное и профессиональное описание физико-химических процессов, происходящих в литий-ионном (в частности, LiFePO4) аккумуляторе при попытке заряда на сильном морозе.
        </p>
        <p className="mb-4 leading-relaxed">
          Проблема заключается в фундаментальном конфликте между термодинамикой и кинетикой:
        </p>

        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Зарядное устройство (Термодинамика)</h3>
            <p className="text-sm text-blue-800">
              Прикладывает внешнее напряжение, создавая мощный энергетический стимул, "заставляющий" ионы лития двигаться к аноду и электроны — восстанавливать их.
            </p>
          </div>
          
          <div className="bg-cyan-50 p-4 rounded-xl border border-cyan-100">
            <h3 className="font-bold text-cyan-900 mb-2">Температура -30°C (Кинетика)</h3>
            <p className="text-sm text-cyan-800">
              Физически "замораживает" процессы, катастрофически снижая подвижность ионов в электролите и способность графита принимать их внутрь своей структуры.
            </p>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-100 mb-6">
          <h3 className="font-bold text-red-900 mb-2">Результат конфликта</h3>
          <p className="text-red-800">
            Вынужденное осаждение металла на поверхности вместо безопасного внедрения внутрь, что приводит к росту дендритов и необратимой деградации ячейки.
          </p>
        </div>

        <p className="italic text-slate-600 border-l-4 border-slate-300 pl-4">
          Именно поэтому для эксплуатации LFP батарей в таких условиях критически необходима система терморегуляции (BMS с функцией подогрева), которая сначала нагреет ячейки хотя бы до 0°C или +5°C, и только потом разрешит подачу зарядного тока.
        </p>
      </motion.div>
    </div>
  );
};
